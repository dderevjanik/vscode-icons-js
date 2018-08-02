/**
 * Script will create json data, which contains dictionaries for runtime,
 * where `key` is name of folder we want icon for and `value` is icon's filename.
 */
import * as log4js from "log4js";
import { readFileSync, createWriteStream } from 'fs';
import { basename, extname } from "path"

const log = log4js.getLogger(basename(__filename, extname(__filename)));
log.level = "debug";

// Open icon definitions
log.debug("opening icon definitions");

const iconsJSONFile = readFileSync('./data/generated/icons.json');
const vsiLanguagesFile = readFileSync('./data/generated/languages-vsi.json');
const vscodeLanguagesFile = readFileSync('./data/static/languages-vscode.json');
const PATH_ICONSDATA = './src/generated/';
type IconKey = string;

// Parse icon definitions
log.debug("parsing icon definitions");
const icons = JSON.parse(iconsJSONFile.toString()) as {
    iconDefinitions: { [iconKey: string]: { iconPath: string } },
    folderNames: { [folderName: string]: IconKey },
    fileExtensions: { [fileExtension: string]: IconKey },
    fileNames: { [fileName: string]: IconKey },
    languageIds: { [language: string]: IconKey }
    light: {
        folderNames: { [folderName: string]: IconKey },
        fileExtensions: { [fileExtension: string]: IconKey },
        fileNames: { [fileName: string]: IconKey },
        languageIds: { [language: string]: IconKey }
    }
};

const vsiLanguages = JSON.parse(vsiLanguagesFile.toString()) as {
    [language: string]: {
        ids: string | string[];
        defaultExtension: string;
    }
};

const vscodeLanguages = JSON.parse(vscodeLanguagesFile.toString()) as {
    [languageId: string]: {
        extensions: string[],
        filenames?: string[]
    }
};

// Icon To Path
const iconToPath: { [icon: string]: string } = Object.keys(icons.iconDefinitions).reduce((acc, icon) => ({
    ...acc,
    [icon]: icons.iconDefinitions[icon].iconPath.split('/').pop()
}), {});


function getIconPath(icon: string) {
    return iconToPath[icon];
}



// FolderNames to Icon
(async function() {
    log.debug("creating table for foldernames");
    const folderIcons = createWriteStream(PATH_ICONSDATA + 'FolderNamesToIcon.ts', { flags: 'w'});
    folderIcons.write(`export const FolderNamesToIcon: { [key: string]: string } = {\n`);
    for (const [folderName, icon] of Object.entries(icons.light.folderNames)) {
        folderIcons.write(`\t'${folderName}': '${getIconPath(icon)}',\n`);
    }
    folderIcons.write("};\n");
    folderIcons.end();
})();

// FileExtensions to Icon
(async function() {
    log.debug("creating table for filextensions");
    const fileExtensions1 = createWriteStream(PATH_ICONSDATA + 'FileExtensions1ToIcon.ts', { flags: 'w'});
    const fileExtensions2 = createWriteStream(PATH_ICONSDATA + 'FileExtensions2ToIcon.ts', { flags: 'w'});
    fileExtensions1.write(`export const FileExtensions1ToIcon: { [key: string]: string } = {\n`);
    fileExtensions2.write(`export const FileExtensions2ToIcon: { [key: string]: string } = {\n`);
    for (const [extension, icon] of Object.entries(icons.light.fileExtensions)) {
        if (extension.indexOf(".") === -1) {
            fileExtensions1.write(`\t'${extension}': '${getIconPath(icon)}',\n`);
        } else {
            fileExtensions2.write(`\t'${extension}': '${getIconPath(icon)}',\n`)
        }

    }
    fileExtensions1.write("};\n");
    fileExtensions2.write("};\n");
    fileExtensions1.end();
    fileExtensions2.end();
})();

// FileNames to Icon
(async function() {
    log.debug("creating table for filenames");
    const alreadyIncludedNames: string[] = [];
    const filenames = createWriteStream(PATH_ICONSDATA + 'FileNamesToIcon.ts', { flags: 'w' });
    filenames.write(`export const FileNamesToIcon: { [key: string]: string } = {\n`);
    // get folder names from vsi langauges definitions
    for (const [filename, icon] of Object.entries(icons.light.fileNames)) {
        filenames.write(`\t'${filename}': '${getIconPath(icon)}',\n`);
        alreadyIncludedNames.push(filename);
    }
    // get folder names from vscode languages definitions
    for (const [language, data] of Object.entries(vscodeLanguages)) {
        if (data.filenames && Object.keys(vsiLanguages).includes(language) && getIconPath(`_f_${language}`)) {
            for(const filename of data.filenames) {
                if (!alreadyIncludedNames.includes(filename)) {
                    filenames.write(`\t'${filename}': '${getIconPath(`_f_${language}`)}',\n`);
                    alreadyIncludedNames.push(filename);
                }
            }
        }
    }
    filenames.write("};\n");
    filenames.end();
})();

// Languages to Icon
(async function() {
    log.debug("creating table for languages");
    const alreadyIncludedLangs: string[] = [];
    const languages = createWriteStream(PATH_ICONSDATA + 'LanguagesToIcon.ts', { flags: 'w' });
    languages.write(`export const LanguagesToIcon: { [key: string]: string } = {\n`);
    for (const [language, icon] of Object.entries(vsiLanguages)) {
        const iconFileName = icons.languageIds[language]
        if (iconFileName) {
            const withoutPrefix = iconFileName.slice(3); // remove prefix "_f_";
            const lightIconFilename = `_f_light_${withoutPrefix}`;
            const existsLightTheme = icons.iconDefinitions[lightIconFilename]; // try to find light theme of icon
            const iconPath = existsLightTheme
                ? getIconPath(lightIconFilename)
                : getIconPath(iconFileName);

            // Are there any language extensions supported by vscode ?
            if (vscodeLanguages[language]) {
                const supportedExtensions = vscodeLanguages[language].extensions;
                const languageExtensions: { [ext: string]: string } = {};
                for (const extension of supportedExtensions) {
                    languageExtensions[extension.slice(1)] = iconPath; // .cpp => cpp
                };
                // Override default extension
                // languageExtensions[icon.defaultExtension] = iconPath;

                for(const [extIcon, extIconPath] of Object.entries(languageExtensions)) {
                    if (!alreadyIncludedLangs.includes(extIcon)) {
                        languages.write(`\t'${extIcon}': '${extIconPath}',\n`);
                        alreadyIncludedLangs.push(extIcon);
                    }
                }
            } else {
                if (!alreadyIncludedLangs.includes(icon.defaultExtension)) {
                    languages.write(`\t'${icon.defaultExtension}': '${iconPath}',\n`);
                    alreadyIncludedLangs.push(icon.defaultExtension);
                }
            }
        }
        // languages.write(`\t"${filename}": "${getIconPath(icon)}",\n`);
    }
    languages.write("};\n");
    languages.end();
})();
