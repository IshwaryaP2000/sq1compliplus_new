import {
  useRef,
  useCallback,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  reconnectEdge,
  Background,
  MiniMap,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import "@xyflow/react/dist/style.css";
import { ToastContainer, toast } from "react-toastify";
import { getApi, postApi } from "../../services/apiService";
import { ApprovalCategorieSidebar } from "./ApprovalCategorieSidebar";

const DnDContext = createContext([null, (_) => {}]);

export const DnDProvider = ({ children }) => {
  const [type, setType] = useState(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = () => {
  return useContext(DnDContext);
};

export const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const edgeReconnectSuccessful = useRef(true);
  const [categoryData, setCategoryData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [rolesData, setRolesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const GetPolicy = async (URI = "policy/policy-settings") => {
    try {
      setIsLoading(true);
      const response = await getApi(URI);
      setCategoryData(Object.values(response?.data?.data?.category));
      setUserData(response?.data?.data?.user);
      setRolesData(response?.data?.data?.roles);
      const savedData = response?.data?.data?.raw_data;
      if (savedData) {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedData);
        setNodes(savedNodes);
        setEdges(savedEdges);
      }
    } catch (error) {
      console.error("error getting a data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetPolicy();
  }, []);

  const onConnect = (params) =>
    nodes.map((sourceItem) => {
      if (sourceItem?.id === params.source) {
        nodes.map((targetItem) => {
          if (targetItem?.id === params.target) {
            if (
              sourceItem?.data.type === "Category" &&
              targetItem?.data.type === "Final"
            ) {
              toast.error(`Node Category to Final can't be connected`);
            } else {
              setEdges((eds) => addEdge({ ...params, animated: true }, eds));
            }
          }
        });
      }
    });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const data = JSON.parse(event.dataTransfer.getData("type"));
      if (data.categoryType === "user") {
        const newNode = {
          id: uuidv4(),
          sourcePosition: "right",
          targetPosition: "left",
          type: data.type,
          position,
          data: {
            label: data.name.replace(/[&\/\\#, +()$~%.'":*?<>{}_-]/g, " "),
            type: data.categoryType,
            id: data.id,
          },
          animated: true,
        };
        setNodes((nds) => (nds || []).concat(newNode));
      } else if (data.categoryType === "role") {
        const newNode = {
          id: uuidv4(),
          sourcePosition: "right",
          targetPosition: "left",
          type: data.type,
          position,
          data: {
            label: data.name.replace(/[&\/\\#, +()$~%.'":*?<>{}_-]/g, " "),
            type: data.categoryType,
          },
          animated: true,
        };
        setNodes((nds) => (nds || []).concat(newNode));
      } else {
        const newNode = {
          id: uuidv4(),
          sourcePosition: "right",
          targetPosition: "left",
          type: data.type,
          position,
          data: {
            label: data.name.replace(/[&\/\\#, +()$~%.'":*?<>{}_-]/g, " "),
            type: data.categoryType,
          },
          animated: true,
        };
        setNodes((nds) => (nds || []).concat(newNode));
      }
    },
    [screenToFlowPosition, type, setNodes]
  );

  const clearModuleSelected = () => {
    setNodes([]);
    setEdges([]);
  };

  const saveEditor = async () => {
    const URI = "policy/approval-data/store";
    const flowData = {
      nodes,
      edges,
    };
    const payload = {
      drawflow_data: JSON.stringify(flowData),
    };
    try {
      setIsLoading(true);
      await postApi(URI, payload);
    } catch (error) {
      console.error("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPanelClick = () => {
    setSelectedNodeId(null);
  };

  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const handleKeyDown = (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      handleDeleteNode();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNodeId]);

  return (
    <div className="row">
      <div className="col-lg-2">
        <ApprovalCategorieSidebar
          categoryData={categoryData}
          userData={userData}
          rolesData={rolesData}
        />
      </div>
      <div className="col-lg-10">
        <div className="dndflow">
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              className="text-capitalize"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              onReconnectStart={onReconnectStart}
              onReconnectEnd={onReconnectEnd}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPanelClick}
            >
              <Controls />
              <Background />
              <MiniMap />
            </ReactFlow>
            <ToastContainer />
            {selectedNodeId && (
              <div className="btn-delete" onClick={handleDeleteNode}>
                Delete Node
              </div>
            )}
            <div className="btn-clear" onClick={clearModuleSelected}>
              Clear All
            </div>
            <div className="btn-save" onClick={saveEditor}>
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
