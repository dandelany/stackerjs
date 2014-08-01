/** @jsx React.DOM */
var React = require('react');

var ReactExample = React.createClass({
    render: function() {
        return (
            <div className="feature">
                <h3>React</h3>
                <p><a href="http://facebook.github.io/react/index.html">Docs</a></p>
                <p>Hello, I'm a React component written in JSX! I live at src/scripts/react-example.jsx</p>
            </div>
        );
    }
});

if( typeof module !== "undefined" && ('exports' in module)) {
    module.exports	= ReactExample;
}