/** @format */

import { system, world } from "@minecraft/server";

// Helper to safely modify blocks outside read-only mode
function safeSetBlock(callback) {
	system.run(callback);
}

// Subscribe to playerInteractWithBlock event to detect if a player interacts with a block
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
	const { block, player, blockFace, faceLocation, itemStack } = event;

	// Exit early if the block is invalid or the item is not a slab
	if (!block || !itemStack || !itemStack.typeId.includes("slab")) {
		return;
	}

	const equipment = player.getComponent("equippable");
	if (!equipment) {
		return;
	}
	const selectedItem = equipment.getEquipment("Mainhand");
	if (!selectedItem) {
		return;
	}
	// Get block adjacent/above/below the interacted block
	let adjacent;
	let adjacentSlab;
	switch (blockFace) {
		case "North":
			adjacent = block.north(1);
			break;
		case "East":
			adjacent = block.east(1);
			break;
		case "South":
			adjacent = block.south(1);
			break;
		case "West":
			adjacent = block.west(1);
			break;
		case "Up":
			adjacent = block.above(1);
			break;
		case "Down":
			adjacent = block.below(1);
			break;
		default:
			console.warn(`Brokennnnn`);
			return;
	}
	const adjacentBlock = adjacent;
	if (
		adjacentBlock.permutation?.getState("minecraft:vertical_half") &&
		adjacentBlock.typeId === selectedItem.typeId
	) {
		adjacentSlab = true;
	} else {
		adjacentSlab = false;
	}
	const verticalHalf = block.permutation?.getState("minecraft:vertical_half");
	const isDoubleSlab = block.permutation?.getState("kado:double");
	// REMOVE LATER - Debugging Purposes
	if (verticalHalf) {
		console.warn(
			`\nBlock: ${block.typeId}\nDouble Slab: ${isDoubleSlab}\nBlock Face: ${blockFace}\nSelected Item: ${selectedItem.typeId}\nAdjacent Block: ${adjacentBlock.typeId}\nVertical Half: ${verticalHalf}\nAdjacent Slab: ${adjacentSlab}`
		);
		// console.warn(`VERTICAL HALF`);
	} else {
		console.warn(
			`\nBlock: ${block.typeId}\nBlock Face: ${blockFace}\nSelected Item: ${selectedItem.typeId}\nAdjacent Block: ${adjacentBlock.typeId}\nAdjacent Slab: ${adjacentSlab}`
		);
		// console.warn(`NO VERTICAL HALF`);
	}
	if (blockFace === ("Up" || "Down") && adjacentSlab) {
		safeSetBlock(() => {
			adjacentBlock.setPermutation;
			adjacentBlock.permutation.withState("kado:double", true);
		});
	}
});
