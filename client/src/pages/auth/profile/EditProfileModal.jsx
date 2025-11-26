import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const EditProfileModal = ({ authUser , cleanId}) => {
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		gender: "",
		bio: "",
		links: "",
		situation: "",
		confirmPassword: "",
		newPassword: "",
		currentPassword: "",
	});

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if (authUser) {
			setFormData({
				firstName: authUser.fullName || "",
				lastName: authUser.username || "",
				email: authUser.email || "",
				gender: authUser.gender || "",
				bio: authUser.bio || "",
				links: authUser.links || "",
				situation: authUser.situation || "",
				newPassword: "",
				currentPassword: "",
				confirmPassword: "",
			});
		}
	}, [authUser]);
	const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/user/update/${cleanId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			if (!res.ok) {
				throw new Error("Profile update failed");
			}
			return res.json();
		},
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			queryClient.setQueryData(["userProfile", cleanId], (prev) => ({
				...prev,
				...data,
			}));
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile();
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='First Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.firstName}
								name='firstName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Last Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.lastName}
								name='lastName'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='email'
							placeholder='Email'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.email}
							name='email'
							onChange={handleInputChange}
						/>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Links'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.links}
								name='links'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<select
							name='situation'
							className='input border border-gray-700 rounded p-2 input-md'
							value={formData.situation}
							onChange={handleInputChange}
						>
							<option value=''>Select Situation</option>
							<option value='Célibataire'>Célibataire</option>
							<option value='Mariée'>Mariée</option>
							<option value="C'est compliqué">C'est compliqué</option>
							<option value='Divorcée'>Divorcée</option>
							<option value='En couple'>En couple</option>
						</select>
						<select
							name='gender'
							className='input border border-gray-700 rounded p-2 input-md'
							value={formData.gender}
							onChange={handleInputChange}
						>
							<option value=''>Select Gender</option>
							<option value='Male'>Male</option>
							<option value='Female'>Female</option>
						</select>
						<input
							type='password'
							placeholder='Current Password'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.currentPassword}
							name='currentPassword'
							onChange={handleInputChange}
						/>
						<input
							type='password'
							placeholder='New Password'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.newPassword}
							name='newPassword'
							onChange={handleInputChange}
						/>
						<input
							type='password'
							placeholder='Confirm Password'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.confirmPassword}
							name='confirmPassword'
							onChange={handleInputChange}
						/>
						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{isUpdatingProfile ? "Updating..." : "Update"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal;
