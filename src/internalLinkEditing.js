/**
 * @module internalLink/internalLinkEditing
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {createKeywordIdElement, createLinkElement} from './util/utils';
import { TwoStepCaretMovement } from '@ckeditor/ckeditor5-typing';
import inlineHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';
import '../theme/editing.css';
import {
    VIEW_INTERNAL_LINK_TAG,
    VIEW_INTERNAL_LINK_ID_ATTRIBUTE,
    MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
    MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
    CLASS_HIGHLIGHT, VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE
} from './util/constants';

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

        editor.conversion.for('upcast').add( dispatcher =>
            dispatcher.on( `element:internallink`, ( evt, data, conversionApi ) => {
                let keywordId = null;
                let internallinkId = null;
                if (data.viewItem.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE)) {
                    internallinkId = data.viewItem.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE);
                }
                if (data.viewItem.getAttribute(VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE)) {
                    keywordId = data.viewItem.getAttribute(VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE);
                }
                if ( !data.modelRange ) {
                    data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
                }
                document.convApi = conversionApi;
                document.vieElem = data.viewItem;

                makeAttributes( data.viewItem, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId );
                makeAttributes( data.viewItem, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internallinkId);

                function makeAttributes( viewElement, attributeName, attributeValue ) {
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
}
