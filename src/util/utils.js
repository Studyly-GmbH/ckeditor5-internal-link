/**
 * @module link/utils
 */

import {VIEW_INTERNAL_LINK_TAG, VIEW_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE} from './constants';

const linkElementSymbol = Symbol('internalLinkElement');

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement(node) {
    return node.is('attributeElement') && !!node.getCustomProperty(linkElementSymbol);
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `internalLinkId` attribute.
 *
 * @param {String} internalLinkId
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement(internalLinkId, { writer }) {
    // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
    const linkElement = writer.createAttributeElement(VIEW_INTERNAL_LINK_TAG,
        { [ VIEW_INTERNAL_LINK_ID_ATTRIBUTE ]: internalLinkId},

        { priority: 5 });
    writer.setCustomProperty(linkElementSymbol, true, linkElement);

    return linkElement;
}

export function createKeywordIdElement(id, { writer }) {
    // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
    const linkElement = writer.createAttributeElement(VIEW_INTERNAL_LINK_TAG,
        { [ VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE ]: id},

        { priority: 5 });
    writer.setCustomProperty(linkElementSymbol, true, linkElement);

    return linkElement;
}

/**
 * Replaces a placeholder inside an url with the actual value.
 * The value is correctly encoded inside this function.
 * @param {*} url The url with placeholder
 * @param {*} placeholder A placeholder to replace
 * @param {*} value The value to insert instead of the placeholder
 */
export function replacePlaceholderInUrl(url, placeholder, value) {
    return url.replace(placeholder, encodeURI(value));
}

export default function clickOutsideHandler({ emitter, activator, callback, contextElements } ) {
    emitter.listenTo( document, 'mousedown', ( evt, domEvt ) => {
        if ( !activator() ) {
            return;
        }
        console.log(domEvt.target)
        // Check if `composedPath` is `undefined` in case the browser does not support native shadow DOM.
        // Can be removed when all supported browsers support native shadow DOM.
        const path = typeof domEvt.composedPath == 'function' ? domEvt.composedPath() : [];

        let modalContainer = document.querySelector('div.custom-modal.modal-dialog.modal-lg');
        let modalContent = document.querySelector('modal-content');
        let cdkContainer = document.querySelector('.cdk-overlay-container');

        if (modalContent != null) {
            if (modalContent.contains(domEvt.target)) {
                return;
            }
        }

        if (modalContainer != null) {
            if (modalContainer.contains(domEvt.target) || domEvt.target.firstChild === modalContainer) {
                return;
            }
        }

        if (cdkContainer != null) {
            if (cdkContainer.contains(domEvt.target)) {
                return;
            }
        }

        for ( const contextElement of contextElements ) {
            if ( contextElement.contains( domEvt.target ) || path.includes( contextElement ) ) {
                return;
            }
        }
        callback();
    } );
}
