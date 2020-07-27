/**
 * This script will extract data from vscode-icons, those data will be later used to
 * Create Icons Data, which will be used in runtime as dictionary where `key` is name of folder
 * we want icon for and `value` is icon's filename.
 */
import * as log4js from 'log4js';
import fetch from 'node-fetch';
import { script } from './utils';
import { writeFileSync } from 'fs';
import { basename, extname } from "path"

const log = log4js.getLogger(basename(__filename, extname(__filename)));
log.level = "debug";

const LANG_URL = 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/src/iconsManifest/languages.ts';

const reKey = /(.*?):/;
const reIds = /ids:.*'(.*?)'/;

fetch(LANG_URL, {})
    .then(res => res.text())
    .then(body => {
        const bodyLines = body.split('\n').slice(3, -2);
        const languages: any = {};
        const keyIdExt = bodyLines.map((fLine: string) => {
            const line = fLine.trim();
            const key = reKey.exec(line);
            // const ids = reIds.exec(line);
            const ext = reIds.exec(line);

            if (key && ext) {
                languages[key[1]] = {
                    defaultExtension: ext[1]
                };
            }
        });
        const languagesJSON = JSON.stringify(languages, null, 2);
        writeFileSync('./data/generated/languages-vsi.json', languagesJSON);
        log.info("successfully downloaded and generated language definitions");
    });
