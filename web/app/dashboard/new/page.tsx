"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CONFIG } from "@/lib/config";

const spongeColors = [
	{ value: "yellow", label: "Yellow" },
	{ value: "orange", label: "Orange" },
	{ value: "red", label: "Red" },
	{ value: "purple", label: "Purple" },
	{ value: "blue", label: "Blue" },
	{ value: "green", label: "Green" },
	{ value: "brown", label: "Brown" },
	{ value: "black", label: "Black" },
];

const spongeTextures = [
	{ value: "soft", label: "Soft" },
	{ value: "firm", label: "Firm" },
	{ value: "rough", label: "Rough" },
	{ value: "smooth", label: "Smooth" },
	{ value: "slimy", label: "Slimy" },
];

const spongePores = [
	{ value: "small", label: "Small" },
	{ value: "medium", label: "Medium" },
	{ value: "large", label: "Large" },
];

const spongeHabitats = [
	{ value: "reef", label: "Coral Reef" },
	{ value: "deepSea", label: "Deep Sea" },
	{ value: "shallowWater", label: "Shallow Water" },
	{ value: "mangrove", label: "Mangrove Swamp" },
	{ value: "kelp", label: "Kelp Forest" },
];

const SpongeForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		size: 50,
		color: "",
		texture: "",
		pores: "",
		habitat: "",
		location: "",
		scientific_name: "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSliderChange = (value) => {
		setFormData((prev) => ({ ...prev, size: value[0] }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${CONFIG.SERVER_URL}/v1/sponge/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			if (!response.ok) throw new Error("Failed to add sponge");
			const data = await response.json();
			console.log("Sponge added successfully:", data);
			// Here you might want to clear the form or show a success message
		} catch (error) {
			console.error("Error adding sponge:", error);
			// Here you might want to show an error message to the user
		}
	};

	return (
		<div className="p-6 max-w-md mx-auto  rounded-xl shadow-md">
			<h2 className="text-2xl font-bold mb-4">Add New Sponge</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div>
					<Label htmlFor="size">Size (cm)</Label>
					<Slider
						id="size"
						defaultValue={[formData.size]}
						max={400}
						step={1}
						onValueChange={handleSliderChange}
					/>
					<div className="text-sm  mt-1">{formData.size} cm</div>
				</div>

				<div>
					<Label htmlFor="color">Color</Label>
					<Select onValueChange={(value) => handleSelectChange("color", value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select color" />
						</SelectTrigger>
						<SelectContent>
							{spongeColors.map((color) => (
								<SelectItem key={color.value} value={color.value}>
									{color.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="texture">Texture</Label>
					<Select
						onValueChange={(value) => handleSelectChange("texture", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select texture" />
						</SelectTrigger>
						<SelectContent>
							{spongeTextures.map((texture) => (
								<SelectItem key={texture.value} value={texture.value}>
									{texture.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="pores">Pores</Label>
					<Select onValueChange={(value) => handleSelectChange("pores", value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select pore size" />
						</SelectTrigger>
						<SelectContent>
							{spongePores.map((pore) => (
								<SelectItem key={pore.value} value={pore.value}>
									{pore.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="habitat">Habitat</Label>
					<Select
						onValueChange={(value) => handleSelectChange("habitat", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select habitat" />
						</SelectTrigger>
						<SelectContent>
							{spongeHabitats.map((habitat) => (
								<SelectItem key={habitat.value} value={habitat.value}>
									{habitat.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="location">Location</Label>
					<Input
						id="location"
						name="location"
						value={formData.location}
						onChange={handleInputChange}
						placeholder="e.g., Great Barrier Reef, Australia"
					/>
				</div>

				<div>
					<Label htmlFor="scientific_name">Scientific Name</Label>
					<Input
						id="scientific_name"
						name="scientific_name"
						value={formData.scientific_name}
						onChange={handleInputChange}
						placeholder="e.g., Spongia officinalis"
					/>
				</div>

				<Button type="submit" className="w-full">
					Add Sponge
				</Button>
			</form>
		</div>
	);
};

export default SpongeForm;