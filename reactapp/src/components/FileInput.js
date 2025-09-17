import React from 'react';

const FileInput = ({ icon: Icon, name, onChange }) => {
  return (
    <div className="input-container">
      {Icon && <Icon className="register-icon" />}
      <input
        type="file"
        name={name}
        onChange={onChange}
      />
    </div>
  );
};

export default FileInput;
