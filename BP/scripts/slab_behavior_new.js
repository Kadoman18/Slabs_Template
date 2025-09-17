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
	let adjacentBlock;
	let adjacentSlab;
	let verticalHalf;
	let isDoubleSlab;
	let mergeIndirect;
	let mergeInteraction;
	if (
		block.typeId === selectedItem.typeId &&
		block.permutation.withState("kado:double", false) &&
		blockFace === ("Up" || "Down")
	) {
		switch (block.permutation?.getState("minecraft:vertical_half")) {
			case "top":
				mergeInteraction = blockFace === "Down" ? true : false;
				break;
			case "bottom":
				mergeInteraction = blockFace === "Up" ? true : false;
				break;
		}
	}
	switch (blockFace) {
		case "North":
			adjacentBlock = block.north(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		case "East":
			adjacentBlock = block.east(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		case "South":
			adjacentBlock = block.south(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		case "West":
			adjacentBlock = block.west(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		case "Up":
			adjacentBlock = block.above(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			} else if (mergeInteraction === true) {
				safeSetBlock(() => {
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		case "Down":
			adjacentBlock = block.below(1);
			mergeIndirect =
				adjacentBlock.typeId === selectedItem.typeId ? true : false;
			if (mergeIndirect === true) {
				safeSetBlock(() => {
					adjacentBlock.setPermutation(
						adjacentBlock.permutation.withState("kado:double", true)
					);
				});
			} else if (mergeInteraction === true) {
				safeSetBlock(() => {
					block.setPermutation(
						block.permutation.withState("kado:double", true)
					);
				});
			}
			break;
		default:
			console.warn(`Brokennnnn`);
			return;
	}
});
