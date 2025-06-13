import React, { useEffect, useState, useRef } from "react";
import { getApi, postApi } from "../../../api/apiClient";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Card } from "react-bootstrap";
import Select from "react-select";

const NewApprovalCategories = () => {
  const [policySettings, setPolicySettings] = useState({
    category: {},
    user: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const userSelectRef = useRef(null);
  const categorySelectRef = useRef(null);

  const fetchPolicySettings = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("/policy/policy-settings");

      if (response?.data?.success) {
        setPolicySettings(response.data.data || { category: {}, user: [] });
      } else {
      }
    } catch (err) {
      console.error("Error fetching policy settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicySettings();
  }, []);

  // Prepare user options for the dropdown
  const userOptions =
    policySettings.user?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || [];

  // Prepare category options for the dropdown
  const categoryOptions = Object.entries(policySettings.category || {}).map(
    ([key, value]) => ({
      value: value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    })
  );

  // Define validation schema
  const validationSchema = Yup.object({
    category: Yup.array().min(1, "At least one category must be selected"),
    method: Yup.string().required("Approval method is required"),
    user_id: Yup.array().min(1, "At least one user must be selected"),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      category: [],
      method: "",
      user_id: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsLoading(true);
        // Create the payload with user_id and category as arrays
        const payload = {
          category: values.category,
          method: values.method, // "any_one" or "all"
          // Send all selected user IDs as an array
          user_id: values.user_id,
        };

        const response = await postApi(
          "/policy/save-approve-category",
          payload
        );

        if (response?.success || response?.data?.success) {
          resetForm();
          // Reset the Select components
          if (userSelectRef.current) {
            userSelectRef.current.clearValue();
          }
          if (categorySelectRef.current) {
            categorySelectRef.current.clearValue();
          }
        } else {
          // Check for specific error messages in the response
          if (response?.data?.errors?.user_id) {
          } else if (response?.data?.errors?.category) {
          } else {
          }
        }
      } catch (err) {
        console.error("Error saving approval category:", err);
        // Extract error message from the response if available
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Handle user selection change from the dropdown
  const handleUserChange = (selectedOptions) => {
    const selectedUserIds = selectedOptions.map((option) =>
      parseInt(option.value)
    );
    formik.setFieldValue("user_id", selectedUserIds);
  };

  // Handle category selection change from the dropdown
  const handleCategoryChange = (selectedOptions) => {
    const selectedCategories = selectedOptions.map((option) => option.value);
    formik.setFieldValue("category", selectedCategories);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="mb-4">
            <h1 className="h4">Approval Categories</h1>
          </div>

          <Card className="shadow-sm ">
            <Card.Body>
              {isLoading && !formik.isSubmitting ? (
                <div className="stackflo-loadert " role="status">
                  <span className="custom-loader "></span>
                </div>
              ) : (
                <Form onSubmit={formik.handleSubmit}>
                  {/* Category Multi-Select Dropdown */}
                  <Form.Group className="mb-4">
                    <Form.Label>Categories</Form.Label>
                    <Select
                      ref={categorySelectRef}
                      isMulti
                      name="category"
                      options={categoryOptions}
                      className={
                        formik.touched.category && formik.errors.category
                          ? "is-invalid"
                          : ""
                      }
                      classNamePrefix="select"
                      onChange={handleCategoryChange}
                      placeholder="Select Categories"
                      value={categoryOptions.filter((option) =>
                        formik.values.category.includes(option.value)
                      )}
                    />
                    {formik.touched.category && formik.errors.category && (
                      <div className="text-danger mt-1 small">
                        {formik.errors.category}
                      </div>
                    )}
                  </Form.Group>
                  {/* Users Multi-Select Dropdown */}
                  <Form.Group className="mb-4">
                    <Form.Label>Users</Form.Label>
                    <Select
                      ref={userSelectRef}
                      isMulti
                      name="user_id"
                      options={userOptions}
                      className={
                        formik.touched.user_id && formik.errors.user_id
                          ? "is-invalid"
                          : ""
                      }
                      classNamePrefix="select"
                      onChange={handleUserChange}
                      placeholder="Select Users"
                      value={userOptions.filter((option) =>
                        formik.values.user_id.includes(parseInt(option.value))
                      )}
                    />
                    {formik.touched.user_id && formik.errors.user_id && (
                      <div className="text-danger mt-1 small">
                        {formik.errors.user_id}
                      </div>
                    )}
                  </Form.Group>
                  {/* Approval Method Radio Buttons - Now Side by Side */}
                  <Form.Group className="mb-4">
                    <Form.Label>Approval Method</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        id="method-any-one"
                        name="method"
                        value="any_one"
                        label="Either One user"
                        checked={formik.values.method === "any_one"}
                        onChange={formik.handleChange}
                        isInvalid={
                          formik.touched.method && !!formik.errors.method
                        }
                      />
                      <Form.Check
                        type="radio"
                        id="method-all"
                        name="method"
                        value="all"
                        label="All users"
                        checked={formik.values.method === "all"}
                        onChange={formik.handleChange}
                        isInvalid={
                          formik.touched.method && !!formik.errors.method
                        }
                      />
                    </div>
                    {formik.touched.method && formik.errors.method && (
                      <div className="text-danger mt-1 small">
                        {formik.errors.method}
                      </div>
                    )}
                  </Form.Group>

                  {/* Centered Save Button */}
                  <div className="d-flex justify-content-center mt-4">
                    <Button
                      type="submit"
                      className="btn primary-btn"
                      disabled={isLoading || formik.isSubmitting}
                    >
                      {formik.isSubmitting ? (
                        <>
                          <div className="stackflo-loadert " role="status">
                            <span className="custom-loader "></span>
                          </div>
                          Saving...
                        </>
                      ) : (
                        "Save Approval Category"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewApprovalCategories;
