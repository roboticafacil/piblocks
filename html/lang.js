'use strict';
/* global options */
Facilino.locales = {
    defaultLanguage: {},
    languages: []
};
Facilino.locales.getLang = function() {
    return this.defaultLanguage.lngCode;
};
Facilino.locales.getKey = function(key) {
    return this.defaultLanguage[key];
};
Facilino.locales.setDefaultLang = function(langCode) {
    for (var i in this.languages) {
        if (this.languages[i].langCode === langCode) {
            this.defaultLanguage = this.languages[i].values;
            this.defaultLanguage.lngCode=langCode;
        }
    }
};
Facilino.locales.add = function(langCode, values) {
    if (!langCode) {
        return this.defaultLanguage;
    }
    if (langCode && !values) {
        if (!this.languages[langCode]) {
            throw new Error('Unknown language : ' + langCode);
        }
        //this.defaultLanguage = langCode;
    }
    if (values || !this.languages[langCode]) {
        this.languages.push({
            langCode: langCode,
            values: values
        });
    }
    return this;
};
Facilino.locales.initialize = function() {
    var lang = options.lang || window.FacilinoLanguage || 'en-GB';
    this.setDefaultLang(lang);
    return this;
};
