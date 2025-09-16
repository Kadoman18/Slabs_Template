/** @format */

import { system, world } from "@minecraft/server";

// Handler for the 'onItemUseOn' event
const slabBlockComponent = {
	onItemUseOn(event) {
		// Destructure event data for easier access
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
		let adjacent;
		switch (blockFace) {
			case "North":
				adjacent = block.north;
				break;
			case "East":
				adjacent = block.east;
				break;
			case "South":
				adjacent = block.south;
				break;
			case "West":
				adjacent = block.west;
				break;
			case "Up":
				adjacent = block.above;
				break;
			case "Down":
				adjacent = block.below;
				break;
			default:
				console.warn(`Brokennnnn`);
				return;
		}
		const adjacentBlock = adjacent;
		console.warn(
			`Event:\nBlock: ${
				block.typeId
			}\nBlock Face: ${blockFace}\nFace Location: ${faceLocation}\nSelected Item: ${
				player.getComponent("equippable").getEquipment("Mainhand").typeId
			}`
		);

		let wasActionTaken = false;

		// SCENARIO 1: Merging by clicking on the slab block itself
		const verticalHalf = block.permutation?.getState(
			"minecraft:vertical_half"
		);
		const isDoubleSlab = block.permutation?.getState("kado:double");

		const isMergingOnBlock =
			selectedItem.typeId === block.typeId &&
			!isDoubleSlab &&
			((verticalHalf === "top" && blockFace === "Down") ||
				(verticalHalf === "bottom" && blockFace === "Up"));

		if (isMergingOnBlock) {
			// PROBLEM LINE
			// system.run maybe?
			block.setPermutation(block.permutation.withState("kado:double", true));
			block.setWaterlogged(false);
			wasActionTaken = true;
		}

		// SCENARIO 2: Merging by clicking on an adjacent block's top/bottom face
		if (
			!wasActionTaken &&
			blockFace === "Up" &&
			adjacentBlock &&
			adjacentBlock.permutation.hasState("minecraft:vertical_half") &&
			adjacentBlock.typeId === selectedItem.typeId &&
			adjacentBlock.permutation.getState("minecraft:vertical_half") ===
				"top" &&
			!adjacentBlock.permutation.getState("kado:double")
		) {
			adjacentBlock.setPermutation(
				adjacentBlock.permutation.withState("kado:double", true)
			);
			wasActionTaken = true;
		}

		if (
			!wasActionTaken &&
			blockFace === "Down" &&
			adjacentBlock &&
			adjacentBlock.permutation.hasState("minecraft:vertical_half") &&
			adjacentBlock.typeId === selectedItem.typeId &&
			adjacentBlock.permutation.getState("minecraft:vertical_half") ===
				"bottom" &&
			!adjacentBlock.permutation.getState("kado:double")
		) {
			adjacentBlock.setPermutation(
				adjacentBlock.permutation.withState("kado:double", true)
			);
			wasActionTaken = true;
		}

		// SCENARIO 3: Merging by clicking on the side of an adjacent block
		if (!wasActionTaken && adjacentBlock) {
			const verticalHalf = adjacentBlock.permutation?.getState(
				"minecraft:vertical_half"
			);
			if (verticalHalf && adjacentBlock.typeId === selectedItem.typeId) {
				adjacentBlock.setPermutation(
					adjacentBlock.permutation.withState("kado:double", true)
				);
				wasActionTaken = true;
			}
		}

		// Fallback to regular placement logic if no merging occurred
		if (!wasActionTaken) {
			// PROBLEM LINE
			const adjacentBlock = block.getSide(blockFace);
			if (adjacentBlock && (adjacentBlock.isAir || adjacentBlock.isLiquid)) {
				let newSlabState;
				if (blockFace === "Up" || blockFace === "Down") {
					newSlabState = blockFace === "Up" ? "bottom" : "top";
				} else {
					newSlabState = faceLocation.y >= 0.5 ? "top" : "bottom";
				}
				adjacentBlock.setPermutation(
					adjacentBlock.permutation
						.withType(selectedItem.typeId)
						.withState("minecraft:vertical_half", newSlabState)
						.withState("kado:double", false)
				);
				wasActionTaken = true;
			}
		}

		if (wasActionTaken) {
			if (player.getGameMode() !== "creative") {
				if (selectedItem.amount > 1) {
					selectedItem.amount--;
					equipment.setEquipment("Mainhand", selectedItem);
				} else if (selectedItem.amount === 1) {
					equipment.setEquipment("Mainhand", undefined);
				}
			}
			player.playSound("use.stone");
		}
	},

	catch(error) {
		console.warn(`[Slab Behavior] An error occurred: ${error.message}`);
	},
};
// --- Subscriptions ---
system.beforeEvents.startup.subscribe(() => {
	// Subscribe to the onItemUseOn event for general slab behavior
	world.beforeEvents.playerInteractWithBlock.subscribe((event) =>
		slabBlockComponent.onItemUseOn(event)
	);
});
