import React from "react";
import { Message } from "semantic-ui-react";

const ErrorMessage = ({ error, text }) => {
  return (
    <Message error>
      <Message.Header>{error.statusText}</Message.Header>
      {error.data && Object.keys(error.data.errors).length > 0 && (
          <Message.List>
              {Object.values(error.data.errors).flat().map((err, index) => (
                  <Message.Item key={index}>{err}</Message.Item>
              ))}
          </Message.List>
      )}
      {text && <Message.Content content={text} />}
    </Message>
  );
};

export default ErrorMessage;
