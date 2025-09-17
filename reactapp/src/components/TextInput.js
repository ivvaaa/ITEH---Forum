import React from 'react';
//import './TextInput.css';

const TextInput = ({ icon: Icon, name, value, onChange, placeholder, type = "text", required = false }) => {
  return (
    <div className="input-container">
      {Icon && <Icon className="register-icon" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default TextInput;
