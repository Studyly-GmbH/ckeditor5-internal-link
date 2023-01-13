/**
 * @module internalLink/internalLinkEditing
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {createKeywordIdElement, createLinkElement} from './util/utils';
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
        let twoStepCaretMovementWithoutSpace = this.editor.plugins.get('TwoStepCaretMovementWithoutSpace')

        twoStepCaretMovementWithoutSpace.registerAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
        twoStepCaretMovementWithoutSpace.registerAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);

        // Setup highlight over selected link.
        inlineHighlight(editor, MODEL_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);
        inlineHighlight(editor, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, VIEW_INTERNAL_LINK_TAG, CLASS_HIGHLIGHT);

/*        const model = this.editor.model;
        const document = model.document;
        let uid = null;
        document.registerPostFixer( writer => {
            /!*if (uid != null ) {
                this.editor.model.change( writer => {
                    writer.restoreSelectionGravity( uid );
                    uid = null;
                } );
            }*!/
            const changes = Array.from( editor.model.document.differ.getChanges());
            const entry = changes[0]
            if ( changes.length !== 1 || entry.type !== 'insert' || entry.name !== '$text' || entry.length != 1 ) {
                console.log('1')
                console.log(changes)
                return;
            }
            if (!entry.attributes.has('keywordId')) {
                console.log('2')
                console.log(changes)
                return;

            }
            if (entry.position.textNode == undefined || !entry.position.textNode.data) {
                console.log('3')
                console.log(changes)
                return;
            }

            let textNode = entry.position.textNode;
            if (textNode.data.endsWith(" ")) {
                const selection = editor.model.document.selection;
                uid = this.editor.model.change( writer => {
                    return writer.overrideSelectionGravity();
                } );
                //let id = writer.overrideSelectionGravity();
                console.log('4')
                console.log(changes)
                console.log(textNode.data)
                let keywordId = textNode.getAttribute('keywordId')
                let internalLinkId = textNode.getAttribute('internalLinkId')

                let endPos = entry.position
                let startPos = model.createPositionFromPath(entry.position.root, textNode.getPath())

                let endPath = endPos.path

                let endPositionWithoutSpace2 = model.createPositionFromPath(entry.position.root, endPath)
                let range = model.createRange(startPos, endPositionWithoutSpace2)
                console.log(range)
                //writer.setSelectionFocus( entry.position.nodeAfter, 'after' )
                writer.removeAttribute('keywordId', entry.position.textNode)
                writer.removeAttribute('internalLinkId', entry.position.textNode)
                //writer.setSelection(selection, { backward: true } )
                writer.setAttribute('keywordId', keywordId, range)
                writer.setAttribute('internalLinkId', internalLinkId, range)
                //writer.restoreSelectionGravity( id )
            }
        })*/
    }
}
