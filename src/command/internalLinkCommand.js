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
import {ObservableMixin} from "@ckeditor/ckeditor5-utils";

/**
 * The internal link command. It is used by the {@link module:internalLink/internalLink~internalLink internal link feature}.
 *
 * @extends module:core/command~Command
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

    keywordButtonView;

    keyword;

    keywordId;

    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        // Make the title observable
        //this.set(PROPERTY_KEYWORD, undefined);
        this.set(PROPERTY_TITLE, undefined);
        this.set(PROPERTY_INTERNAL_LINK_ID, undefined);
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

        if (this.value !== newValue) {
            this.value = newValue;

            if (this.value) {
                new InternalLinkDataContext(this.editor).getShortDescriptionById(this.value)
                    .then(response => {
                        this.title = response.data[0].shortDescription; //TODO: change this later
                    })
                    .catch((e) => {
                        console.log(e)
                        this.title = t('Error requesting title');
                    });
            } else {
                this.title = '';
            }
        }

        const newKeywordId = doc.selection.getAttribute(MODEL_INTERNAL_KEYWORD_ID_ATTRIBUTE);
        console.log('keywordcheck')
        console.log(this.keyword);
        console.log(newKeywordId);

        if (this.keywordId !== newKeywordId) {
            this.keywordId = newKeywordId;

            if (this.keyword || true) {
                new InternalLinkDataContext(this.editor).getKeywordById(this.keywordId)
                    .then(response => {
                        this.keyword = response.data[0].keyword;
                        console.log(this.keyword)
                        if (this.keywordButtonView !== undefined) {
                            this.keywordButtonView.label = response.data[0].keyword;
                        }
                    }).catch((e) => {
                    console.log(e)
                    this.keyword = t('Error requesting keyword');
                });
            } else {
                this.keyword = '';
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
     * new {@link module:engine/model/text~Text Text node} with the `internalLinkId` attribute will be inserted in place of caret, but
     * only if such element is allowed in this place. The `_data` of the inserted text will equal the `internalLinkId` parameter.
     * The selection will be updated to wrap the just inserted text node.
     *
     * When the selection is collapsed and inside the text with the `internalLinkId` attribute, the attribute value will be updated.
     *
     * @fires execute
     * @param {String} internalLinkId Link destination.
     * @param {String} internalLinkText Link text that is rendered if there is no selection otherwise the selected text will be rendered.
     * @param {String} keywordId Id of keyword
     */
    execute(internalLinkId, internalLinkText, keywordId) {
        console.log('exeCute');
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
                    writer.setAttribute(MODEL_INTERNAL_LINK_ID_ATTRIBUTE, internalLinkId, range);
                }
            }
        });
    }

}
