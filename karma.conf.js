module.exports = function(config) {

    config.set({
        frameworks: ['systemjs', 'jasmine'],
        browsers: ['Chrome'],
        files: [
            { pattern: 'node_modules/regenerator/runtime.js' },
            { pattern: 'src/*.js', included: false },
            { pattern: 'spec/*-spec.js' }
        ],
        preprocessors: {
            'src/*.js': ['babel'],
            'spec/*-spec.js': ['babel']
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015-native-modules'],
                plugins: [
                    'syntax-async-functions',
                    'transform-regenerator',
                    'transform-es2015-modules-systemjs'
                ],
                sourceMap: 'inline'
            }
        }
    });

}
