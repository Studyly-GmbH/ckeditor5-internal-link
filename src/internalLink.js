/**
 * @module InternalLink/InternalLink
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import InternalLinkConfig from './config/internalLinkConfig';
import InternalLinkCommandRegistration from './command/internalLinkCommandRegistration';
import InternalLinkEditing from './internalLinkEditing';
import InternalLinkUi from './ui/internalLinkUi';
import {TwoStepCaretMovement} from "@ckeditor/ckeditor5-typing";
import TwoStepCaretMovementWithoutSpace from "./util/twostepcaretmovementwithoutspace";

/**
 * The internal link plugin. It introduces the Link and Unlink buttons for internal links.
 *
 * It loads the {@link module:InternalLink/InlineLink inline link feature}.
 *
 * //@extends module:core/plugin~Plugin
 */
export default class InternalLink extends Plugin {

    /**
     * @inheritDoc
     */
    static get requires() {
        return [InternalLinkConfig, TwoStepCaretMovementWithoutSpace, InternalLinkCommandRegistration, InternalLinkEditing, InternalLinkUi, TwoStepCaretMovement];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'internalLink';
    }

}
