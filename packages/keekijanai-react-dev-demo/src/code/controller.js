/* eslint-disable */

import { createPreBindedCodePresetFull } from "@keekijanai/react";

export const requireRaw = require.context("!raw-loader!./demos", true, /\.(js|css|scss|html)/);

export const requireDemo = require.context("./demos", true, /\.(js)/);

export const Demo = createPreBindedCodePresetFull(requireDemo, requireRaw);
