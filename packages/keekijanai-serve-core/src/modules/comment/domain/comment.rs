use crate::modules::{
    comment::model::Comment,
    user::model::{User, UserRole},
};

#[derive(Debug, Clone)]
pub struct CommentDomain {
    pub comment: Comment,
    pub owner: User,
    pub reference: Option<Box<CommentDomain>>,
    pub reference_loaded: bool,
}

impl CommentDomain {
    pub fn like_own(&self, user: &User) -> bool {
        if user.role == UserRole::Admin {
            return true;
        }
        if user.id == self.owner.id {
            return true;
        }
        return false;
    }
    pub fn get_reference_comment_ref(&self) -> Option<&Box<CommentDomain>> {
        self.reference.as_ref().map(|comment| &*comment)
    }
}
