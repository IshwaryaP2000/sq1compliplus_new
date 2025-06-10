import Accordion from "react-bootstrap/Accordion";
import { useDnD } from "./ApprovalCategorieDrawflow";

const DraggableButton = ({ name, type, categoryType, id }) => {
  const [_, setType] = useDnD();

  const onDragStart = (event) => {
    setType(type);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "type",
      JSON.stringify({ name, type, categoryType, id })
    );
  };

  return (
    <div className="accordian-category">
      <p
        className="category-button text-capitalize"
        draggable
        onDragStart={onDragStart}
      >
        {name.replace(/[&\/\\#, +()$~%.'":*?<>{}_-]/g, " ")}
      </p>
    </div>
  );
};

export const ApprovalCategorieSidebar = ({
  categoryData,
  userData,
  rolesData,
}) => {
  return (
    <aside>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Category</Accordion.Header>
          {categoryData.map((item, id) => (
            <Accordion.Body key={id}>
              <DraggableButton
                name={`${item}`}
                type="input"
                categoryType="Category"
              />
            </Accordion.Body>
          ))}
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Users</Accordion.Header>
          {userData.map((item, id) => (
            <Accordion.Body key={id}>
              <DraggableButton
                name={`${item.email}`}
                type=""
                categoryType="user"
                id={`${item.id}`}
              />
            </Accordion.Body>
          ))}
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Roles</Accordion.Header>
          {rolesData.map((item, id) => (
            <Accordion.Body key={id}>
              <DraggableButton name={`${item}`} type="" categoryType="role" />
            </Accordion.Body>
          ))}
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Final</Accordion.Header>
          <Accordion.Body>
            <DraggableButton
              name="Policy Approval"
              type="output"
              categoryType="Final"
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </aside>
  );
};
