export interface InternalLinkConfig {
    testmode?: boolean
    autocompleteUrl?: string
    keywordUrl?: string
    shortDescriptionUrl?: string
    axiosInstance?: any
    previewUrl?: string
}

declare module '@ckeditor/ckeditor5-core' {
    interface EditorConfig {
        internallink?: InternalLinkConfig
    }
}
