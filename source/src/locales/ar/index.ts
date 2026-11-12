import type { en } from '../en';
import { common } from './common';
import { pub } from './public';
import { edu } from './education';
import { pt } from './patient';
import { ph } from './physician';

/** Typed against the English dictionary: a missing or extra key fails the build. */
export const ar: typeof en = { ...common, pub, edu, pt, ph };
