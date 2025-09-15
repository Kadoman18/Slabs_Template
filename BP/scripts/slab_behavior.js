/** @format */

// Import necessary modules from Minecraft server API
import { system, world } from "@minecraft/server";

// This object will contain the handler for the 'onItemUseOn' event
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

		console.warn(
			`Event:\nBlock: ${
				block.typeId
			}\nBlock Face: ${blockFace}\nFace Location: ${faceLocation}\nSelected Item: ${
				player.getComponent("equippable").getEquipment("Mainhand").typeId
			}`
		);

		let wasActionTaken = false;

		//Attempt to get permutation states; handle cases where block may not have these states
		// SCENARIO 1: Merging by clicking on the slab block itself
		const verticalHalf = block.permutation.hasState("minecraft:vertical_half")
			? block.permutation.getState("minecraft:vertical_half")
			: null;
		const isDoubleSlab = block.permutation.hasState("kado:double")
			? block.permutation.getState("kado:double")
			: false;

		const isMergingOnBlock =
			selectedItem.typeId === block.typeId &&
			!isDoubleSlab &&
			((verticalHalf === "top" && blockFace === "Down") ||
				(verticalHalf === "bottom" && blockFace === "Up"));

		if (isMergingOnBlock) {
			block.setPermutation(block.permutation.withState("kado:double", true));
			block.setWaterlogged(false);
			wasActionTaken = true;
		}

		// SCENARIO 2: Merging by clicking on an adjacent block's top/bottom face
		if (!wasActionTaken) {
			// Check if a top slab exists above the block we're clicking on
			const blockAbove = block.above;
			if (
				blockFace === "Up" &&
				blockAbove &&
				blockAbove.permutation.hasState("minecraft:vertical_half") &&
				blockAbove.typeId === selectedItem.typeId &&
				blockAbove.permutation.getState("minecraft:vertical_half") ===
					"top" &&
				!blockAbove.permutation.getState("kado:double")
			) {
				blockAbove.setPermutation(
					blockAbove.permutation.withState("kado:double", true)
				);
				wasActionTaken = true;
			}
		}

		if (!wasActionTaken) {
			// Check if a bottom slab exists below the block we're clicking on
			const blockBelow = block.below;
			if (
				blockFace === "Down" &&
				blockBelow &&
				blockBelow.permutation.hasState("minecraft:vertical_half") &&
				blockBelow.typeId === selectedItem.typeId &&
				blockBelow.permutation.getState("minecraft:vertical_half") ===
					"bottom" &&
				!blockBelow.permutation.getState("kado:double")
			) {
				blockBelow.setPermutation(
					blockBelow.permutation.withState("kado:double", true)
				);
				wasActionTaken = true;
			}
		}

		// SCENARIO 3: Merging by clicking on the north side of an adjacent block
		if (!wasActionTaken && blockFace === "North") {
			const northBlock = block.north;
			if (northBlock) {
				const verticalHalf = northBlock.permutation.hasState(
					"minecraft:vertical_half"
				)
					? northBlock.permutation.getState("minecraft:vertical_half")
					: null;
				if (verticalHalf && northBlock.typeId === selectedItem.typeId) {
					northBlock.setPermutation(
						northBlock.permutation.withState("kado:double", true)
					);
					wasActionTaken = true;
				}
			}
		}

		// SCENARIO 4: Merging by clicking on the east side of an adjacent block
		if (!wasActionTaken && blockFace === "East") {
			const eastBlock = block.east;
			if (eastBlock) {
				const verticalHalf = eastBlock.permutation.hasState(
					"minecraft:vertical_half"
				)
					? eastBlock.permutation.getState("minecraft:vertical_half")
					: null;
				if (verticalHalf && eastBlock.typeId === selectedItem.typeId) {
					eastBlock.setPermutation(
						eastBlock.permutation.withState("kado:double", true)
					);
					wasActionTaken = true;
				}
			}
		}

		// SCENARIO 5: Merging by clicking on the south side of an adjacent block
		if (!wasActionTaken && blockFace === "South") {
			const southBlock = block.south;
			if (southBlock) {
				const verticalHalf = southBlock.permutation.hasState(
					"minecraft:vertical_half"
				)
					? southBlock.permutation.getState("minecraft:vertical_half")
					: null;
				if (verticalHalf && southBlock.typeId === selectedItem.typeId) {
					southBlock.setPermutation(
						eastBlock.permutation.withState("kado:double", true)
					);
					wasActionTaken = true;
				}
			}
		}

		// SCENARIO 6: Merging by clicking on the west side of an adjacent block
		if (!wasActionTaken && blockFace === "West") {
			const westBlock = block.west;
			if (westBlock) {
				const verticalHalf = westBlock.permutation.hasState(
					"minecraft:vertical_half"
				)
					? westBlock.permutation.getState("minecraft:vertical_half")
					: null;
				if (verticalHalf && westBlock.typeId === selectedItem.typeId) {
					westBlock.setPermutation(
						westBlock.permutation.withState("kado:double", true)
					);
					wasActionTaken = true;
				}
			}
		}

		// Fallback to regular placement logic if no merging occurred
		if (!wasActionTaken) {
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
