import React from "react";
import styles from "./MessageBubble.module.css";

const CheckIcon = ({ double = false, read = false }) => (
  <svg
    className={styles.checkIcon}
    width="16"
    height="11"
    viewBox="0 0 16 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {double ? (
      <>
        <path
          d="M1 5.5L4.5 9L10 2"
          stroke={read ? "#53BDEB" : "#8696A0"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5.5L8.5 9L14 2"
          stroke={read ? "#53BDEB" : "#8696A0"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <path
        d="M1 5.5L4.5 9L10 2"
        stroke="#8696A0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const MessageBubble = ({
  message,
  type,
  timestamp,
  senderName,
  status = "sent",
}) => {
  const isSent = type === "sent";

  return (
    <div className={`${styles.messageWrapper} ${isSent ? styles.sent : styles.received}`}>
      <div className={`${styles.messageBubble} ${isSent ? styles.sent : styles.received}`}>
        {/* Tail */}
        <span className={`${styles.tail} ${isSent ? styles.sent : styles.received}`} aria-hidden="true">
          {isSent ? (
            <svg width="8" height="13" viewBox="0 0 8 13" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 Q8 0 8 13 L0 6Z" fill="#D9FDD3" />
            </svg>
          ) : (
            <svg width="8" height="13" viewBox="0 0 8 13" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0 Q0 0 0 13 L8 6Z" fill="white" />
            </svg>
          )}
        </span>

        {/* Sender Name (for received messages in group chats) */}
        {!isSent && senderName && (
          <p className={styles.senderName}>
            {senderName}
          </p>
        )}

        {/* Message text */}
        <span className={styles.messageText}>{message}</span>

        {/* Timestamp and status */}
        <span className={styles.timestampContainer}>
          {timestamp && (
            <span className={styles.timestamp}>{timestamp}</span>
          )}
          {isSent && (
            <span className={styles.statusIcon}>
              {status === "sent" && <CheckIcon />}
              {status === "delivered" && <CheckIcon double />}
              {status === "read" && <CheckIcon double read />}
            </span>
          )}
        </span>

        {/* Clearfix for float */}
        <div className={styles.clearBoth} />
      </div>
    </div>
  );
};

export default MessageBubble;