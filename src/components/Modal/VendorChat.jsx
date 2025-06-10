import { useState, useEffect, useRef } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { postApi } from "../../services/apiService";

function VendorChat({ updateStatus, type, vendor, unReadCount }) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");
  const [messages, SetMessages] = useState([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(unReadCount || 0);
  const chatBodyRef = useRef(null);
  let list = "";
  let store = "";
  const textareaRef = useRef(null);
  const lineHeight = 24;
  const maxRows = 3;

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    getChat();
    setLocalUnreadCount(0);
  };

  if (type === "organization") {
    list = "/organization/qa-comment/list";
    store = "/organization/qa-comment/store";
  } else if (type === "vendor") {
    list = "/vendor/qa-comment/list";
    store = "/vendor/qa-comment/store";
  }

  const getChat = async () => {
    try {
      let data = {
        vendor_qas_id: updateStatus,
        vendor_id: vendor,
      };
      const res = await postApi(list, data);
      SetMessages(res?.data?.data?.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (text.trim() !== "") {
      const data = {
        vendor_qas_id: updateStatus,
        vendor_id: vendor,
        comment: text,
      };
      try {
        const res = await postApi(store, data);
        SetMessages(res?.data?.data?.data);
        setText("");
        setTimeout(() => {
          if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
          }
        }, 0);
      } catch (err) {
        console.log("error");
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight;
      const maxHeight = lineHeight * maxRows;
      textarea.style.height = `${Math.min(newHeight, maxHeight)}px`;
      textarea.style.overflowY = newHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleChange = (event) => {
    setText(event.target.value);
    adjustTextareaHeight();
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-top">View Chat</Tooltip>}
        trigger={["hover"]}
      >
        <button
          style={{ overflow: "visible !important" }}
          className={`${
            updateStatus === "1" ? "custom-disabled" : ""
          }  btn vendorbtn-submit position-relative slide-text-btn py-2`}
          onClick={handleShow}
        >
          <i className="fa-regular fa-comment me-1 icon"></i>
          {localUnreadCount > 0 ? (
            <div
              className="badge rounded rounded-circle position-absolute top-0  translate-middle bg-danger text-white ms-1 upload-badge "
              style={{ right: "-37%" }}
            >
              <span>{localUnreadCount}</span>
            </div>
          ) : (
            <></>
          )}
        </button>
      </OverlayTrigger>

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-dialog-left"
        centered
      >
        <Modal.Header closeButton>
          <div className="d-flex align-items-center">
            <div className="user-avator_wraper">
              <img src="/images/stackflo-icon.svg" alt="Logo"></img>
            </div>
            <div className="user-name_wrapper ms-2">
              <h6 className="user-name_content typing-animation">
                Queries Chat
              </h6>
              <p className="last-seen_content mt-1">
                <span>
                  <i className="fa-solid fa-circle-check active-icon me-1"></i>
                </span>
                Active
              </p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="chat-main_wrapper">
            <div
              className="chat-body-container"
              style={{
                overflowY: "auto",
                flexGrow: 1,
              }}
              ref={chatBodyRef}
            >
              {messages.map((msg, i) => {
                // console.log("msg", msg);
                let currentUserId;
                if (type === "vendor") {
                  currentUserId = msg.vendor_id;
                } else if (type === "organization") {
                  currentUserId = msg.organization_id;
                }
                const isSender = currentUserId === msg.from;
                return (
                  <div className={isSender ? "sender" : "reciver"} key={i}>
                    <p className="chat-para">
                      {msg?.comment}
                      <span>
                        {msg?.created_at}
                        {isSender && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height={isSender ? "18px" : "15px"}
                            viewBox="0 -960 960 960"
                            width={isSender ? "18px" : "15px"}
                            fill={`${
                              msg?.is_read == 1
                                ? "rgba(0, 123, 255, 0.52)"
                                : "rgba(125,125,125,1)"
                            }`}
                          >
                            <path d="M494-240 268-466l56-57 170 170 368-368 56 57-424 424Z" />
                            {msg?.is_read == 1 && (
                              <>
                                <path d="M268-240 42-466l57-56 170 170 56 56-57 56Z" />
                                <path d="M494-240 268-466l56-57 170 170 368-368 56 57-424 424Z" />
                                <path d="M494-466l-57-56 198-198 57 56-198 198Z" />
                              </>
                            )}
                          </svg>
                        )}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="message-type_wrapper">
              <div className="inner-text-type-area">
                <div className="emoji_wrapper cusor-pointer">
                  <i className="fa-regular fa-plus "></i>
                </div>
                <div className="text-typeing-input mt-1">
                  <textarea
                    ref={textareaRef}
                    placeholder="Enter Text..."
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{
                      overflowY: "hidden",
                      resize: "none",
                      lineHeight: `${lineHeight}px`,
                      fontSize: "15px",
                    }}
                  />
                </div>
              </div>
              <button className="btn vocie-icon_wrapper" onClick={sendMessage}>
                Send <i className="fa-solid fa-paper-plane ms-1"></i>
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default VendorChat;
