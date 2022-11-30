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
                    keywordId = data.viewItem.getAttribute('internallinkid');
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
                /*
                preserveElementAttributes( data.viewItem, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internallinkId);
                preserveElementAttributes( data.viewItem, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internallinkId);
                //preserveElementAttributes( data.viewItem, 'keywordid' );

                function preserveElementAttributes( viewElement, attributeName ) {
                    const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );
                    console.log(viewAttributes)
                    if ( viewAttributes ) {
                        conversionApi.writer.setAttribute( attributeName, viewAttributes, data.modelRange );
                    }
                }*/



               /* for ( const node of data.modelRange.getItems() ) {
                    console.log(node)
/!*                    if ( conversionApi.schema.checkAttribute( node, 'internallinkid' ) ) {
                        // Node's children are converted recursively, so node can already include model attribute.
                        // We want to extend it, not replace.
                        console.log('check internallinkid')
                        const nodeAttributes = node.getAttribute( 'internallinkid' );
                        const attributesToAdd = mergeViewElementAttributes( viewAttributes, nodeAttributes || {} );

                        conversionApi.writer.setAttribute( 'internallinkid', attributesToAdd, node );
                    }
                    if ( conversionApi.schema.checkAttribute( node, 'keywordid' ) ) {
                        // Node's children are converted recursively, so node can already include model attribute.
                        // We want to extend it, not replace.
                        console.log('check keywordid')
                        const nodeAttributes = node.getAttribute(  'keywordid' );
                        const attributesToAdd = mergeViewElementAttributes( viewAttributes, nodeAttributes || {} );

                        conversionApi.writer.setAttribute( 'keywordid', attributesToAdd, node );
                    }*!/
                    conversionApi.writer.setAttribute( 'keywordId', keywordId, node );
                    conversionApi.writer.setAttribute( 'internalLinkId', internallinkId, node );
                }


                let viewAttributes = dataFilter.processViewAttributes( data.viewItem, conversionApi );
                console.log(viewAttributes);
                // Do not apply the attribute if the element itself is already consumed and there are no view attributes to store.
                if ( !viewAttributes && !conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
                    return;
                }

                // Otherwise, we might need to convert it to an empty object just to preserve element itself,
                // for example `<cite>` => <$text htmlCite="{}">.
                viewAttributes = viewAttributes || {};

                // Consume the element itself if it wasn't consumed by any other converter.
                conversionApi.consumable.consume( data.viewItem, { name: true } );

                // Since we are converting to attribute we need a range on which we will set the attribute.
                // If the range is not created yet, we will create it.
                if ( !data.modelRange ) {
                    data = Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
                }

                // Set attribute on each item in range according to the schema.
                for ( const node of data.modelRange.getItems() ) {
                    if ( conversionApi.schema.checkAttribute( node, 'internallinkid' ) ) {
                        // Node's children are converted recursively, so node can already include model attribute.
                        // We want to extend it, not replace.
                        const nodeAttributes = node.getAttribute(  'internallinkid' );
                        const attributesToAdd = mergeViewElementAttributes( viewAttributes, nodeAttributes || {} );

                        conversionApi.writer.setAttribute( 'internallinkid', attributesToAdd, node );
                    }
                }*/
            }, { priority: 'low' } )
        )
      /*  editor.conversion.for('upcast')
            .elementToAttribute({
                view: {
                    name: VIEW_INTERNAL_LINK_TAG,
                    attributes: {
                        // This is important to ensure that the internal links are not
                        // removed if text with an internal link is pasted to ckeditor
                        [ VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE ]: true
                    }
                },
                model:/!* {
                    // The internal attribute name
                    key: MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
                    // The html tag attribute
                    value: viewElement => {
                        console.log(viewElement)
                        return viewElement.getAttribute(VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE)},

                    //keywordId: viewElement => viewElement.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE)
                }*!/ ( viewElement, { writer } ) => {
                    let linkId = viewElement.getAttribute(VIEW_INTERNAL_LINK_ID_ATTRIBUTE)
                    let keywordId = viewElement.getAttribute(VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE)
                    writer.createAttribute( MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId )
                    return writer.setAttribute( MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId);
                }

            });*/

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
