var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.tumblr.com/v2/'
});

var pickInputs = {
        'base-hostname': { key: 'base_hostname', validate: {req: true} },
        'type': 'type',
        'body': 'body',
        'state': 'state',
        'tags': 'tags',
        'tweet': 'tweet',
        'date': 'date',
        'url': 'url',
        'quote': 'quote'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            oauth = dexter.provider('tumblr').credentials(),
            uriLink = 'blog/' + inputs.base_hostname + '/post';

        if (validateErrors)
            return this.fail(validateErrors);

        //send API request
        request.post({
            url: uriLink,
            form: _.omit(inputs, 'base-hostname'),
            oauth: oauth,
            json: true
        }, function (error, response, body) {
            if (error)
                this.fail(error);

            else if (_.parseInt(response.statusCode) !== 201)
                this.fail(body);

            else
                this.complete({post_id: _.get(body, 'response.id')});
        }.bind(this));
    }
};
