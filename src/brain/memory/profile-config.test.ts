import { describe, expect, it } from "vitest"
import {
	buildBrainPersonalEntityContext,
	buildBrainPrivateChannelEntityContext,
	buildBrainSelfEntityContext,
	buildBrainSharedEntityContext,
	ENTITY_CONTEXT_MAX_CHARS,
} from "./profile-config"

// supermemory 400s a container tag whose entityContext is over the limit, and
// profile sync swallows that error, so an over-long context silently leaves the
// tag unconfigured. Inputs are at their realistic maximums (Slack caps channel
// names at 80 characters) plus a free-text line far longer than any room left.
const LONG_NAME = "x".repeat(80)
const LONG_TEXT = "y".repeat(5000)

describe("entity contexts fit supermemory's limit", () => {
	it.each([
		[
			"shared",
			buildBrainSharedEntityContext({
				orgName: LONG_NAME,
				domain: `${LONG_NAME}.com`,
				about: LONG_TEXT,
			}),
		],
		[
			"private channel",
			buildBrainPrivateChannelEntityContext({
				channelName: LONG_NAME,
				purpose: LONG_TEXT,
			}),
		],
		["personal", buildBrainPersonalEntityContext({ memberName: LONG_NAME })],
		["self", buildBrainSelfEntityContext()],
	])("%s", (_, context) => {
		expect(context.length).toBeLessThanOrEqual(ENTITY_CONTEXT_MAX_CHARS)
	})

	it("keeps a short About line whole and trims a long one", () => {
		const short = buildBrainSharedEntityContext({
			orgName: "Bilrost",
			about: "We automate loan document processing.",
		})
		expect(short).toContain("About: We automate loan document processing.")

		const long = buildBrainSharedEntityContext({
			orgName: "Bilrost",
			about: LONG_TEXT,
		})
		expect(long).toMatch(/About: y+…\n/)
		expect(long.length).toBe(ENTITY_CONTEXT_MAX_CHARS)
	})
})
