import "reflect-metadata";
import React, { useEffect, useState } from "react";
import { AuthAvatar, Star, KeekijanaiProvider, Comment, Stat, OAuth2CallbackRedirect } from "@keekijanai/react";
import "../styles/index.css";
import { Link } from "gatsby";

function Index() {
  const belong = "/";

  return (
    <main>
      <Link to="/css-trick">CSS Trick</Link>
    </main>
  );
}

export default Index;
