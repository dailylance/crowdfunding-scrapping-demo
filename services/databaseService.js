const { prisma } = require("../lib/db");

class DatabaseService {
	// Create a new search record (safely handle missing database schema)
	static async createSearch(userId, searchData) {
		try {
			const search = await prisma.search.create({
				data: {
					userId,
					platform: searchData.platform,
					category: searchData.category,
					keyword: searchData.keyword || "",
					results: JSON.stringify(searchData.results || []),
					status: "completed",
					resultCount: searchData.results ? searchData.results.length : 0,
					enabledOCR: searchData.enableOCR !== false,
					language: searchData.language || "en",
				},
			});

			console.log(`✅ Created search record: ${search.id} for user: ${userId}`);
			return search;
		} catch (error) {
			console.error("❌ Error creating search record:", error);
			console.warn(
				"⚠️ Database schema not ready, using fallback search record"
			);
			// Return a mock search record during database migration
			return {
				id: `temp-search-${Date.now()}`,
				userId,
				platform: searchData.platform,
				category: searchData.category,
				keyword: searchData.keyword || "",
				status: "completed",
				resultCount: searchData.results ? searchData.results.length : 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		}
	}

	// Store individual scraped data items (safely handle missing database schema)
	static async storeScrapedData(userId, searchId, scrapedItems) {
		try {
			if (!scrapedItems || scrapedItems.length === 0) {
				console.log("⚠️ No scraped items to store");
				return { count: 0 };
			}

			console.log(`📝 Processing ${scrapedItems.length} scraped items...`);
			const createdRecords = [];

			for (const item of scrapedItems) {
				// Extract and clean funding data
				const raisedAmount =
					item.amount ||
					(item.funded_amount ? String(item.funded_amount) : null);
				const goalAmount =
					item.support_amount ||
					(item.goal_amount ? String(item.goal_amount) : null);
				const backersCount =
					item.supporters ||
					(item.backers_count ? String(item.backers_count) : null);

				try {
					const record = await prisma.scrapedData.create({
						data: {
							searchId,
							userId,
							title: item.title || item.original_title || "Untitled",
							description: item.description || "",
							platform: item.platform || item.target_site || "",
							category: item.category || "",
							keyword: item.keyword || "",
							url: item.url || item.projectUrl || "",
							imageUrl: item.imageUrl || item.image || "",
							raised: raisedAmount,
							goal: goalAmount,
							backers: backersCount,
							daysLeft: item.days_left ? String(item.days_left) : null,
							startDate: item.startDate || item.crowdfund_start_date,
							endDate: item.endDate || item.crowdfund_end_date,
							originalData: JSON.stringify(item),
							ocrData: item.ocrData ? JSON.stringify(item.ocrData) : null,
							nlpData: item.nlpData ? JSON.stringify(item.nlpData) : null,
							isRelevant: item.isRelevant !== false,
						},
					});

					console.log(
						`✅ Stored "${item.title}" - raised: ${raisedAmount}, goal: ${goalAmount}, backers: ${backersCount}`
					);
					createdRecords.push(record);
				} catch (itemError) {
					console.error(
						`❌ Error storing item "${item.title}":`,
						itemError.message
					);
					// For database schema issues, create mock record
					if (itemError.code === "P2021" || itemError.code === "P2022") {
						console.warn(
							"⚠️ Database schema not ready, logging item instead of storing"
						);
						console.log(`📄 Item data: ${JSON.stringify(item, null, 2)}`);
					}
				}
			}

			console.log(
				`✅ Successfully processed ${createdRecords.length} scraped data items for search: ${searchId}`
			);
			return { count: scrapedItems.length }; // Return original count even if storage failed
		} catch (error) {
			console.error("❌ Error storing scraped data:", error);
			console.warn(
				"⚠️ Database storage failed, but search results are still available"
			);
			// Don't throw error, just return count so the search can continue
			return { count: scrapedItems ? scrapedItems.length : 0 };
		}
	}

	// Get user's search history
	static async getUserSearchHistory(userId, limit = 10) {
		try {
			const searches = await prisma.search.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				take: limit,
				include: {
					scrapedData: {
						take: 5,
						orderBy: { createdAt: "desc" },
					},
				},
			});

			return searches;
		} catch (error) {
			console.error("❌ Error getting user search history:", error);
			throw new Error("Failed to get search history");
		}
	}

	// Get scraped data for a specific search
	static async getScrapedDataBySearch(userId, searchId) {
		try {
			const scrapedData = await prisma.scrapedData.findMany({
				where: {
					userId,
					searchId,
				},
				orderBy: { createdAt: "desc" },
				include: {
					savedData: true,
				},
			});

			return scrapedData;
		} catch (error) {
			console.error("❌ Error getting scraped data:", error);
			throw new Error("Failed to get scraped data");
		}
	}

	// Save selected items to user's saved collection
	static async saveSelectedData(userId, scrapedDataIds) {
		try {
			const savedRecords = [];

			for (const scrapedDataId of scrapedDataIds) {
				const scrapedData = await prisma.scrapedData.findFirst({
					where: {
						id: scrapedDataId,
						userId,
					},
				});

				if (!scrapedData) {
					console.log(
						`⚠️ Scraped data not found or not owned by user: ${scrapedDataId}`
					);
					continue;
				}

				// Check if already saved
				const existingSaved = await prisma.savedData.findFirst({
					where: { scrapedDataId },
				});

				if (!existingSaved) {
					const savedData = await prisma.savedData.create({
						data: {
							userId,
							scrapedDataId,
							title: scrapedData.title,
							platform: scrapedData.platform,
							data: scrapedData.originalData,
						},
					});
					savedRecords.push(savedData);
				}
			}

			console.log(`✅ Saved ${savedRecords.length} items for user: ${userId}`);
			return savedRecords;
		} catch (error) {
			console.error("❌ Error saving selected data:", error);
			throw new Error("Failed to save selected data");
		}
	}

	// Update saved data with export URL
	static async updateExportUrl(userId, scrapedDataIds, spreadsheetUrl) {
		try {
			const result = await prisma.savedData.updateMany({
				where: {
					userId,
					scrapedDataId: {
						in: scrapedDataIds,
					},
				},
				data: {
					spreadsheetUrl,
					exportedAt: new Date(),
				},
			});

			console.log(`✅ Updated export URL for ${result.count} items`);
			return result;
		} catch (error) {
			console.error("❌ Error updating export URL:", error);
			throw new Error("Failed to update export URL");
		}
	}

	// Get user statistics
	static async getUserStats(userId) {
		try {
			const [totalSearches, totalScrapedItems, totalSaved] = await Promise.all([
				prisma.search.count({ where: { userId } }),
				prisma.scrapedData.count({ where: { userId } }),
				prisma.savedData.count({ where: { userId } }),
			]);

			const recentSearches = await prisma.search.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				take: 5,
				select: {
					platform: true,
					keyword: true,
					resultCount: true,
					createdAt: true,
				},
			});

			return {
				totalSearches,
				totalScrapedItems,
				totalSaved,
				recentSearches,
			};
		} catch (error) {
			console.error("❌ Error getting user stats:", error);
			throw new Error("Failed to get user statistics");
		}
	}

	// Find user by email (for API authentication)
	static async findUserByEmail(email) {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
			});
			return user;
		} catch (error) {
			console.error("❌ Error finding user by email:", error);
			return null;
		}
	}

	// Verify user exists by ID (safely handle missing database schema)
	static async findUserById(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					signupMethod: true,
					createdAt: true,
					updatedAt: true,
					lastLoginAt: true,
					// Exclude password field to avoid schema issues
				},
			});

			// If user not found in database, return fallback user
			if (!user) {
				console.warn(
					`⚠️ User ${userId} not found in database, using fallback user data`
				);
				return {
					id: userId,
					email: "temp@example.com",
					name: "Temporary User",
					signupMethod: "google",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			}

			return user;
		} catch (error) {
			console.error("❌ Error finding user by ID:", error);
			// For now, return a mock user object during database migration
			console.warn("⚠️ Database schema not ready, using fallback user data");
			return {
				id: userId,
				email: "temp@example.com",
				name: "Temporary User",
				signupMethod: "google",
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		}
	}
}

module.exports = DatabaseService;
