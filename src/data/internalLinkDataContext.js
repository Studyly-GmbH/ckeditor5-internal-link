/**
 * @module InternalLink/InternalLinkDataContext
 */

import { replacePlaceholderInUrl } from '../util/utils';

import {
    CONFIG_TEST_MODE,
    CONFIG_AUTOCOMPLETE_URL,
    CONFIG_SHORT_DESCRIPTION_URL,
    URL_PLACEHOLDER_SHORT_DESCRIPTION_ID,
    URL_PLACEHOLDER_SEARCH_TERM,
    CONFIG_KEYWORD_URL,
    URL_PLACEHOLDER_KEYWORD_ID
} from '../util/constants';

/**
 * This is used to call a web service for finding
 * items and getting the item name by id.
 */
export default class InternalLinkDataContext {

    constructor(editor) {
        this.editor = editor;
    }

    /**
     * Gets the autocomplete suggestions
     * @param {string} searchTerm The term that is entered into our search box
     */
    getAutocompleteItems(searchTerm) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_AUTOCOMPLETE_URL);
        const autocompleteUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_SEARCH_TERM, searchTerm);

        if (isTestMode) {
            return this.getAutocompleteTestData(searchTerm);
        }
        return this.getJsonWithCredentials( autocompleteUrl );
    }

    /**
     * Loads the title of an item
     * @param {string} itemId The id of an item you want to load
     */
    getShortDescriptionById(itemId) {
        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_SHORT_DESCRIPTION_URL);
        const shortDescriptionUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_SHORT_DESCRIPTION_ID, itemId);

        if (isTestMode) {
            return this.getTitleTestData(itemId);
        }

        return this.getJsonWithCredentials( shortDescriptionUrl );
    }

    /**
     * Loads the title of an item
     * @param {string} itemId The id of an item you want to load
     */
    getKeywordById(itemId) {

        if (itemId == undefined) {
            console.warn('itemId is undefind')
        }

        const isTestMode = this.editor.config.get(CONFIG_TEST_MODE);
        const url = this.editor.config.get(CONFIG_KEYWORD_URL);
        const keyWordUrl = replacePlaceholderInUrl(url, URL_PLACEHOLDER_KEYWORD_ID, itemId);

        if (isTestMode) {
            return this.getTitleTestData(itemId);
        }

        return  this.getJsonWithCredentials( keyWordUrl );
    }

    /**
     * Gets the autocomplete test data
     * @param {string} searchTerm The term that is entered into our searchbox
     */
    getAutocompleteTestData(searchTerm) {
        const testData = {
            data: [
                { label: 'SearchTerm: ' + searchTerm, value: '1' },
                { label: 'Vuejs', value: '1001' },
                { label: 'Javascript', value: '500' }
            ]
        };

        return Promise.resolve(testData);
    }

    /**
     * Gets the title test data
     * @param {string} itemId The id of an item you want to load
     */
    getTitleTestData(itemId) {
        let title = 'Item: ' + itemId;

        if (itemId == '500') {
            title = 'Javascript';
        } else if (itemId == '1001') {
            title = 'Vuejs';
        }

        return Promise.resolve({ data: title });
    }

    async getJsonWithCredentials( url ) {
        const response = await fetch( url, {
            method: 'GET',
            credentials: 'include'
        } );

        if ( !response.ok ) {
            throw new Error( `Request failed: ${ response.status } ${ response.statusText }` );
        }

        const data = await response.json();

        // Axios-like response shape, so existing code using response.data still works.
        return {
            data
        };
    }
}
