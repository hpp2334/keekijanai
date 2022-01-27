use proc_macro::TokenStream;
use quote::quote;
use syn::{parse::Parse, parse_macro_input, DeriveInput, LitStr, Token};

struct RespErrAttrArgs {
    _eq: Token![=],
    code: LitStr,
}

impl Parse for RespErrAttrArgs {
    fn parse(input: syn::parse::ParseStream) -> syn::Result<Self> {
        Ok(RespErrAttrArgs {
            _eq: input.parse()?,
            code: input.parse()?,
        })
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

    let RespErrAttrArgs { code, .. } =
        syn::parse2::<RespErrAttrArgs>(attr.tokens).expect(r#"attr "code" not found"#);

    let fields = data.fields;
    let num_list = (0..fields.len())
        .step_by(1)
        .map(|i| syn::Index::from(i))
        .collect::<Vec<syn::Index>>();
    let num_list = num_list.iter();

    let expanded = quote! {

        impl std::convert::Into<keekijanai_serve_resp_err::ServeRespErr> for #name {
            fn into(self) -> keekijanai_serve_resp_err::ServeRespErr {
                let mut v = std::vec::Vec::new();
                #( v.push(self.#num_list.to_string()); )*

                keekijanai_serve_resp_err::ServeRespErr {
                    code: #code,
                    params: v,
                }
            }
        }
    };
    TokenStream::from(expanded)
}
