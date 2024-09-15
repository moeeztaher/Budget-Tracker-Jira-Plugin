import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('react-app-root');
  if (root) {
    ReactDOM.render(<App />, root);
  } else {
    console.error('Could not find react-app-root element');
  }
});