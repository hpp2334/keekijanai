#!/usr/bin/env node

import "./build";
import "./bundle-analyse";

import { program } from "commander";

program.parse(process.argv);
