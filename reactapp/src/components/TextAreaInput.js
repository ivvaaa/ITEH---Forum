import React from 'react';
//import './TextareaInput.css';

const TextAreaInput = ({ icon: Icon, name, value, onChange, placeholder }) => {
  return (
    <div className="input-container">
      {Icon && <Icon className="register-icon" />}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      ></textarea>
    </div>
  );
};

export default TextAreaInput;
