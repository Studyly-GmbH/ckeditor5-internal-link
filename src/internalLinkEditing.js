/**
 * @module internalLink/internalLinkEditing
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {createKeywordIdElement, createLinkElement} from './util/utils';
import { TwoStepCaretMovement } from '@ckeditor/ckeditor5-typing';
import inlineHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';
const linkElementSymbol = Symbol('internalLinkElement');
import '../theme/editing.css';
import {
    VIEW_INTERNAL_LINK_TAG,
    VIEW_INTERNAL_LINK_ID_ATTRIBUTE,
    MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
    MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
    CLASS_HIGHLIGHT, VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE
} from './util/constants';
import {extractDelimiters} from "ckeditor5-math/src/utils";
import {mergeViewElementAttributes} from "@ckeditor/ckeditor5-html-support/src/conversionutils";
import {DataFilter} from "@ckeditor/ckeditor5-html-support";

/**
 * The link engine feature.
 *
 * It introduces the `internalLinkId="id"` attribute in the model which renders to
 * the view as a `<internallink internalLinkId="1d">` element.
 *
 * //@extends module:core/plugin~Plugin
 */
export default class InternalLinkEditing extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        // Allow link attribute on all inline nodes.
        //let dataFilter = this.editor.plugins.get( DataFilter );
        editor.model.schema.extend('$text', {
            allowAttributes: [MODEL_INTERNAL_LINK_ID_ATTRIBUTE, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
            VIEW_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE]
        });
        this._registerDownCastConverter(editor)

        editor.conversion.for('dataDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                view: createLinkElement });
        editor.conversion.for('editingDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                view: (internalLinkId, conversionApi) => {
                    return createLinkElement(internalLinkId, conversionApi);
                }
            });

/*
        editor.conversion.for('upcast')
            .elementToAttribute({
                view: {
                    name: VIEW_INTERNAL_LINK_TAG
                },
                model: {
                    // The internal attribute name
                    key: MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
                    // The html tag attribute
                    value: (viewElement, { writer } ) => {
                        console.log(writer)
                        console.log(viewElement)
                        const keywordId = viewElement.getAttribute(VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE)
                        console.log(keywordId)
                        /!*writer.model.createAttribute( MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId);*!/
                        return viewElement.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE)
                    }
                },
            });
*/

        editor.conversion.for('upcast').add( dispatcher =>
            dispatcher.on( `element:internallink`, ( evt, data, conversionApi ) => {
                console.log(data.viewItem)
                let keywordId = null;
                let internallinkId = null;
                if (data.viewItem.getAttribute('internallinkid')) {
                    console.log('internallinkid')
                    console.log(data.viewItem.getAttribute('internallinkid'))
                    internallinkId = data.viewItem.getAttribute('internallinkid');
                }
                if (data.viewItem.getAttribute('keywordid')) {
                    console.log('keywordid')
                    console.log(data.viewItem.getAttribute('keywordid'))
                    keywordId = data.viewItem.getAttribute('keywordid');
                }
                if ( !data.modelRange ) {
                    data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
                }
                document.convApi = conversionApi;
                document.vieElem = data.viewItem;

                makeAttributes( data.viewItem, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId );
                makeAttributes( data.viewItem, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internallinkId);
                //preserveElementAttributes( data.viewItem, 'keywordid' );

                function makeAttributes( viewElement, attributeName, attributeValue ) {
                    console.log(viewElement)
                    console.log(attributeName)
                    console.log(attributeValue)
                    console.log(data)
                    conversionApi.writer.setAttribute( attributeName, attributeValue, data.modelRange );
                }
            }, { priority: 'low' } )
        )

        // Enable two-step caret movement for `internalLinkId` attribute.
        editor.plugins.get(TwoStepCaretMovement).registerAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
        editor.plugins.get(TwoStepCaretMovement).registerAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);

        // Setup highlight over selected link.
        inlineHighlight(editor, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);
        inlineHighlight(editor, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);
    }

    _registerDownCastConverter(editor) {

        editor.conversion.for('dataDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
                view: createKeywordIdElement });
        editor.conversion.for('editingDowncast')
            .attributeToElement({
                model: MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
                view: (internalLinkId, conversionApi) => {
                    return createKeywordIdElement(internalLinkId, conversionApi);
                }});
    }

}
