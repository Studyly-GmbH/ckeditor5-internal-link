export interface InternalLinkConfig {
    testmode?: boolean
    autocompleteUrl?: string
    keywordUrl?: string
    shortDescriptionUrl?: string
    axiosInstance?: any
    previewUrl?: string
}

declare module '@ckeditor/ckeditor5-core/src/editor/editorconfig' {
    interface EditorConfig {
        internallink?: InternalLinkConfig
    }
}
