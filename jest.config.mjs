import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const API_TESTS_DIRECTORY = "<rootDir>/src/app/api/";

const sharedConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

const jsdomProject = {
	...sharedConfig,
	displayName: "jsdom",
	testEnvironment: "jsdom",
	testPathIgnorePatterns: [API_TESTS_DIRECTORY],
};

const nodeProject = {
	...sharedConfig,
	displayName: "node",
	testEnvironment: "node",
	testMatch: [`${API_TESTS_DIRECTORY}**/*.test.[jt]s?(x)`],
};

export default async function config() {
	const projects = await Promise.all([createJestConfig(jsdomProject)(), createJestConfig(nodeProject)()]);

	return { projects };
}
