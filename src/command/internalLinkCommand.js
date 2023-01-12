/**
 * @module internalLink/internalLinkCommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findLinkRange from '../util/findlinkrange';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import InternalLinkDataContext from '../data/internalLinkDataContext';

import {
    MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE,
    MODEL_INTERNAL_LINK_ID_ATTRIBUTE,
    PROPERTY_INTERNAL_LINK_ID,
    PROPERTY_TITLE
} from '../util/constants';

/**
 * The internal link command. It is used by the {@link module?:internalLink?/internalLink~internalLink internal link feature}.
 *
 * @extends module?:core/command~Command
 */
export default class InternalLinkCommand extends Command {

    /**
     * The value of the `'internalLinkId'` attribute if the start of the selection is located in a node with this attribute.
     *
     * @observable
     * @readonly
     * @member {Object|undefined} #value
     */

    /**
     * The title of the internal link if the start of the selection is located in a node with this attribute.
     *
     * @observable
     * @readonly
     * @member {Object|undefined} #title
     */

    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        // Make the title observable
        //this.set(PROPERTY_KEYWORD, undefined);
        this.set(PROPERTY_TITLE, undefined);
        this.set(PROPERTY_INTERNAL_LINK_ID, undefined);
        this.keywordButtonView = undefined;

        this.keyword = undefined;

        this.keywordId = undefined;

        this.ui = undefined;

        const model = this.editor.model;
        const document = model.document;
        const selection = model.document.selection;
        let attributeKeys = ['keywordId', 'internalLinkId']

/*
        editor.model.document.on( 'change:data', ( evt, batch ) => {
            console.log('change:data')
/!*            let a = model.schema.checkAttributeInSelection(doc.selection, MODEL_INTERNAL_LINK_ID_ATTRIBUTE)
            console.log(a)*!/
            const changes = Array.from( editor.model.document.differ.getChanges() );
            const entry = changes[ 0 ];

            // Typing is represented by only a single change.
            if ( changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1 ) {
                console.log('not one type change')
                return;
            }
            if (!entry.attributes.has('keywordId')) {
                console.log('no keywordId')
                return;
            }
            entry.position.stickiness = "toNext";
            if (entry.attributes.has('keywordId')) {
                console.log('hasAttribute')
            }
            console.log('batch', batch)
            console.log('entry', entry)

            let element = entry.position.nodeAfter;
            console.log('element', element)
            let attributeKeys = ['keywordId', 'internalLinkId']
            batch.operations.forEach(x => {
                x.shouldReceiveAttributes = false;
                if (x.nodes != null) {
                    for (let node of x.nodes) {
                        x._attrs = []
                    }
                }
            });
            /!*for ( const { item } of entry.range.getWalker( { shallow: true } ) ) {
                for ( const attributeKey of attributeKeys ) {
                    if ( item.hasAttribute( attributeKey ) ) {
                        writer.removeAttribute( attributeKey, item );
                    }
                }
            }*!/
        })
*/


        document.registerPostFixer( writer => {

            const changes = Array.from( editor.model.document.differ.getChanges() );
            //console.log(changes)
            const entry = changes[0]
            console.log(entry)
            if ( changes.length !== 1 || entry.type !== 'insert' || entry.name !== '$text' || entry.length != 1 ) {
                console.log('not one type change')
                return;
            }
            if (!entry.attributes.has('keywordId')) {
                console.log('no keywordId')
                return;
            }
            //console.log(entry.position.data)
            let textNode = ""
            if (entry.position.textNode != undefined && entry.position.textNode.data) {
                textNode = entry.position.textNode
            }
            textNode = entry.position.textNode;
            console.log(textNode)
            if (textNode.data.endsWith(" ")) {
                let keywordId = textNode.getAttribute('keywordId')
                let internalLinkId = textNode.getAttribute('internalLinkId')
                /*writer.removeAttribute('keywordId', entry.position.textNode)
                writer.removeAttribute('internalLinkId', entry.position.textNode)*/

                let endPos = entry.position
                let startPos = model.createPositionFromPath(entry.position.root, textNode.getPath())
                console.log('startPos' , startPos)
                console.log('entry.position', endPos)

                let endPath2 = endPos.path
                console.log(endPath2)
                //endPath2[endPath2.length-1] = endPath2[endPath2.length-1] - 1
                console.log(endPath2)
                let endPositionWithoutSpace2 = model.createPositionFromPath(entry.position.root, endPath2)
                let range2 = model.createRange(startPos, endPositionWithoutSpace2)
                console.log(range2)
                writer.removeAttribute('keywordId', entry.position.textNode)
                writer.removeAttribute('internalLinkId', entry.position.textNode)
                writer.setAttribute('keywordId', keywordId, range2)
                writer.setAttribute('internalLinkId', internalLinkId, range2)

               /* let endPath = textNode.getPath()
                console.log(endPath)
                endPath[endPath.length-1] = endPath[endPath.length-1] - 1
                console.log(endPath)
                let endPositionWithoutSpace = model.createPositionFromPath(entry.position.root, endPath)
                let range = model.createRange(endPositionWithoutSpace2, entry.position)
                console.log(range)
                writer.removeAttribute('keywordId', entry.position.textNode)
                writer.removeAttribute('internalLinkId', entry.position.textNode)
                //console.log(range.)
                writer.setAttribute('keywordId', keywordId, range)
                writer.setAttribute('internalLinkId', internalLinkId, range)
                //writer.setAttribute()*/
            }

            //model.createRange( start.getShiftedBy( array[ 0 ] ), start.getShiftedBy( array[ 1 ] ) );
/*            for (const change of document.differ.getChanges()) {
                console.log(change)

                const root = this.editor.model.document.getRoot();

                for ( const child of root.getChildren() ) {
                    for ( const child1 of child.getChildren() ) {
                        for (const attributeKey of attributeKeys) {
                            if (child1.hasAttribute(attributeKey)) {
                                writer.removeAttribute(attributeKey, child1);
                            }
                        }
                    }
                }*/
/*                if (change.type == 'insert' || change.type == 'attribute' && change.attributeKey == 'imageStyle') {
                    let element = change.type == 'insert' ? change.position.nodeAfter : change.range.start.nodeAfter;

                    if (element && element.is('element', 'paragraph') && element.childCount > 0) {
                        element = element.getChild(0);
                    }
                    console.log(element);
                    /!*if (!imageUtils.isImage(element)) {
                        continue;
                    }*!/

                    const imageStyle = element.getAttribute('imageStyle');

                    if (!imageStyle) {
                        continue;
                    }
/!*
                    const imageStyleDefinition = stylesMap.get(imageStyle);

                    if (!imageStyleDefinition || !imageStyleDefinition.modelElements.includes(element.name)) {
                        writer.removeAttribute('imageStyle', element);
                        changed = true;
                    }*!/
                }*/

        })
    }

    /**
     * @inheritDoc
     */
    refresh() {

        const model = this.editor.model;
        const doc = model.document;
        const t = this.editor.locale && this.editor.locale.t;

        // Checks whether the attribute is allowed in selection (returns true if the attribute is not existing)
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, MODEL_INTERNAL_LINK_ID_ATTRIBUTE)
            // && model.schema.checkAttributeInSelection(doc.selection, MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);

        const newValue = doc.selection.getAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE);
        console.log('refresch')
        if (this.value !== newValue) {
            this.value = newValue;

            if (this.value) {
                new InternalLinkDataContext(this.editor).getShortDescriptionById(this.value)
                    .then(response => {
                        this.title = response.data[0].shortDescription; //TODO: change this later
                    })
                    .catch((e) => {
                        if (e.name === "AxiosError") {
                            console.log('axiosError', e.code, e.message)
                        } else {
                            console.log(e);
                        }
                        this.title = t('Error requesting title');
                    }).then(_ => {
                        this.ui.fireEvent(1); //fires everytime when the new short description is loaded
                    });
            } else {
                this.title = '';
            }
        }

        const newKeywordId = doc.selection.getAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);
        if (this.keywordId !== newKeywordId) {
            this.keywordId = newKeywordId;

            if (this.keywordId) {
                new InternalLinkDataContext(this.editor).getKeywordById(this.keywordId)
                    .then(response => {
                        this.keyword = response.data.keyword;
                        if (this.keywordButtonView !== undefined) {
                            this.keywordButtonView.label = response.data.keyword;
                        }
                    }).catch((e) => {
                    if (e.name === "AxiosError") {
                        console.log('axiosError', e.code, e.message)
                    } else {
                        console.log(e);
                    }
                    this.keyword = t('Error requesting keyword');
                });
            } else {
                this.keyword = '';
                this.keywordId = undefined;
                if (this.keywordButtonView !== undefined) {
                    this.keywordButtonView.label = '';
                }
            }
        }

    }

    /**
     * Executes the command.
     *
     * When the selection is non-collapsed, the `internalLinkId` attribute will be applied to nodes inside the selection, but only to
     * those nodes where the `internalLinkId` attribute is allowed (disallowed nodes will be omitted).
     *
     * When the selection is collapsed and is not inside the text with the `internalLinkId` attribute, the
     * new {@link module?:engine/model/text~Text Text node} with the `internalLinkId` attribute will be inserted in place of caret, but
     * only if such element is allowed in this place. The `_data` of the inserted text will equal the `internalLinkId` parameter.
     * The selection will be updated to wrap the just inserted text node.
     *
     * When the selection is collapsed and inside the text with the `internalLinkId` attribute, the attribute value will be updated.
     *
     * @param {String} internalLinkId Link destination.
     * @param {String} internalLinkText Link text that is rendered if there is no selection otherwise the selected text will be rendered.
     * @param {String} keywordId Id of keyword
     */
    execute(internalLinkId, internalLinkText, keywordId) {

        const model = this.editor.model;
        const selection = model.document.selection;

        model.change(writer => {
            // If selection is collapsed then update selected link or insert new one at the place of caret.
            if (selection.isCollapsed) {
                const position = selection.getFirstPosition();

                // When selection is inside text with `internalLinkId` attribute.
                if (selection.hasAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE)) {
                    // Then update `internalLinkId` value.
                    const linkRange = findLinkRange(
                        selection.getFirstPosition(),
                        selection.getAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE),
                        model);

                    writer.setAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId, linkRange);
                    writer.setAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId, linkRange);
                    // Create new range wrapping changed link.
                    writer.setSelection(linkRange);
                }
                // If not then insert text node with `internalLinkId` attribute in place of caret.
                // However, since selection in collapsed, attribute value will be used as data for text node.
                // So, if `internalLinkId` is empty, do not create text node.
                else if (internalLinkId !== '') {
                    const attributes = toMap(selection.getAttributes());

                    attributes.set(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId);
                    attributes.set(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId)

                    const node = writer.createText(internalLinkText, attributes);

                    writer.insert(node, position);

                    // Create new range wrapping created node.
                    writer.setSelection(writer.createRangeOn(node));
                }
            } else {
                // If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
                // omitting nodes where `internalLinkId` attribute is disallowed.
                const ranges = model.schema.getValidRanges(selection.getRanges(), MODEL_INTERNAL_LINK_ID_ATTRIBUTE);

                for (const range of ranges) {
                    writer.setAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId, range);
                }

                const rangesKeyword = model.schema.getValidRanges(selection.getRanges(), MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);

                for (const range of rangesKeyword) {
                    writer.setAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE, keywordId, range);
                }
            }
        });
    }

}
