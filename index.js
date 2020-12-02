const _ = require('lodash')

/*
  This is formatted oddly in order to get a nice final shape
  in `button.scss`.

  Essentially what the template is doing is looping through
  the props object and outputting the top-level properties
  as the parent classnames, then for each child props of
  "classname" it looks to see if the child prop is an object,
  if it is, then it outputs the Sass `&.` operator with the
  child prop rule as the sub classname and then each child
  prop of the value as the final CSS style rule and value.
  If it's not an object then it outputs the rule and value
  as the CSS style rule and value.
*/
const template = _.template(`<% _.each(props, function(prop, classname) { %>.<%= classname %> {
<% _.each(prop, (value, rule) => { %><% if (typeof value === 'object') { %>  &.<%= rule %> {<% _.each(value, (subvalue, subrule) => { %>
    <%= subrule %>: <%= subvalue %>;<% }) %>
  }<% } else { %>  <%= rule %>: <%= value %>;<% } %>
<% }) %><% }) %>}
`)

const StyleDictionary = require('style-dictionary')
  .registerFormat({
    name: 'scss/button',
    formatter: function(dictionary, config) {
      /*
        allProperties is an array containing all the matched
        tokens based on the filter.
      */
      const { allProperties } = dictionary

      /*
        Set up an empty object to hold the final shape to pass
        to the custom template.

        After the allProperties.map(), props will look like this:
        {
          'component-button': {
            padding: '16px',
            'font-size': '16px',
            'text-align': 'center',
            primary: { 'background-color': '#e63c19', color: '#ffffff' },
            secondary: { 'background-color': '#fad8d1', color: '#0000ff' }
          }
        }
      */
      const props = {}

      // go through properties and structure final props object
      allProperties.map(prop => {
        /*
          Extract the attributes object created by the 'attribute/cti'
          transform and the transformed token value.
        */
        const { attributes, value } = prop

        // extract attributes to build custom class and style rules
        const { category, type, item, subitem } = attributes

        // build main classname for .scss file
        const classname = `${category}-${type}`

        /*
          Add to the props object if it doesn't already exist.
          We run the check to see if the classname exists already as an
          object property because in our case, `classname` will be the
          same for each token object in allProperties because each token
          is under the same category and type.
        */
        if (!props.hasOwnProperty(classname)) {
          props[classname] = {}
        }

        /*
          If the token object has a subitem, use the item as the subclass.
          Run the same check to see if this particular subclass (item) has
          been added yet.
        */
        if (subitem) {
          if (!props[classname].hasOwnProperty(item)) {
            props[classname][item] = {}
          }

          // add the subitem and value as final CSS rule
          props[classname][item][subitem] = value
        }
        else {
          // add the item as a CSS rule, not a subclass
          props[classname][item] = value
        }
      })

      /*
        Pass the final `props` object to our custom template to render
        the contents for the final button.scss file.
      */
      return template({ props })
    }
  })
  .extend({
    source: ['button.json'],
    platforms: {
      scss: {
        buildPath: 'build/',
        transforms: [
          'attribute/cti',  // setup attributes object
          'color/css',      // transform color values to hex
          'name/cti/kebab', // prevent name collisions
          'size/px'         // transform size values to px
        ],
        files: [
          {
            destination: 'button.scss',
            format: 'scss/button',
            filter: {
              attributes: {
                category: 'component',
                type: 'button'
              }
            }
          }
        ]
      }
    }
  })

// run Style Dictionary
StyleDictionary.buildAllPlatforms()
