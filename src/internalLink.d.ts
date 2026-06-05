import { Plugin } from 'ckeditor5';

declare module 'ckeditor5-internal-link' {
    export default class InternalLink extends Plugin {}
}

export interface InternalLinkConfig {
    testmode?: boolean
    autocompleteUrl?: string
    keywordUrl?: string
    shortDescriptionUrl?: string
    previewUrl?: string
}

declare module '@ckeditor/ckeditor5-core' {
    interface EditorConfig {
        internallink?: InternalLinkConfig
    }
}
