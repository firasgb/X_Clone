import { Link } from "react-router-dom";
import { useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    gender: "",
  });
  const queryClient = useQueryClient();
  const {error,isPending,mutate:signup,isError} = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Welcome to X " + data.firstName + " " + data.lastName);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="First Name"
                name="firstName"
                onChange={handleInputChange}
                value={formData.firstName}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
            <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Last Name"
                name="lastName"
                onChange={handleInputChange}
                value={formData.lastName}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <select
							name='gender'
							className='input border rounded input-md h-full grow'
							value={formData.gender}
							onChange={handleInputChange}
						>
							<option value=''>Select Gender</option>
							<option value='Male'>Male</option>
							<option value='Female'>Female</option>
						</select>
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Confirm Password"
              name="confirmPassword"
              onChange={handleInputChange}
              value={formData.confirmPassword}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
