import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InlineLink extends Plugin {

    static get requires() {
        return [];
    }

    static get pluginName() {
        return 'InlineLink';
    }

}
