extern crate darling;

use darling::FromMeta;
use proc_macro::TokenStream;
use quote::quote;
use syn::{
    parenthesized, parse::Parse, parse_macro_input, punctuated::Punctuated, token, DeriveInput,
    Lit, NestedMeta, Path, Token,
};

#[derive(Debug, FromMeta)]
struct RespErrAttrArgs {
    code: Lit,
    status: Path,
}

impl Parse for RespErrAttrArgs {
    fn parse(input: syn::parse::ParseStream) -> syn::Result<Self> {
        let fields_content;
        // [(] ... [)]
        let _parenthesized: token::Paren = parenthesized!(fields_content in input);
        // ([...], [...])
        let fields: Punctuated<NestedMeta, Token![,]> =
            fields_content.parse_terminated(NestedMeta::parse)?;

        let fields: Vec<NestedMeta> = fields.into_iter().collect();

        let attr_args = RespErrAttrArgs::from_list(&fields).unwrap();

        Ok(attr_args)
    }
}

#[proc_macro_derive(KeekijanaiRespErr, attributes(resp_err))]
pub fn derive_keekijanai_resp_err(input: TokenStream) -> TokenStream {
    let mut input = parse_macro_input!(input as DeriveInput);

    let name = input.ident;

    let data = if let syn::Data::Struct(data) = input.data {
        data
    } else {
        panic!("expect struct");
    };

    let attr = input.attrs.pop().expect("need resp_err attr");

    let RespErrAttrArgs { code, status } = syn::parse2::<RespErrAttrArgs>(attr.tokens)
        .expect(r#"parse resp_err sub meta fields fail"#);

    let fields = data.fields;
    let num_list = (0..fields.len())
        .step_by(1)
        .map(|i| syn::Index::from(i))
        .collect::<Vec<syn::Index>>();
    let num_list = num_list.iter();

    let expanded = quote! {

        impl std::convert::From<#name> for crate::core::ServeError {
            fn from(this: #name) -> crate::core::ServeError {
                let mut v = std::vec::Vec::new();
                #( v.push(this.#num_list.to_string()); )*

                crate::core::ServeError {
                    code: #code,
                    status: #status,
                    params: v,
                    source: None
                }
            }
        }
    };
    TokenStream::from(expanded)
}
