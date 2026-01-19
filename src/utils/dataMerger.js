/**
 * Data Merger Utility
 * Combines data from multiple Copilot report files, handling duplicate dates
 */

/**
 * Creates a unique key for a record to identify duplicates
 * @param {Object} record - A single data record
 * @returns {string} - Unique key combining date and user
 */
export function getRecordKey(record) {
  const date = record.date || record.day || ''
  const user = record.user_login || record.user || ''
  return `${date}|${user}`
}

/**
 * Merges multiple datasets, removing duplicates based on date + user combination
 * When duplicates are found, the later occurrence is kept (assumes newer data is more accurate)
 * @param {Array<Array>} datasets - Array of parsed data arrays
 * @returns {Array} - Merged and deduplicated data
 */
export function mergeDatasets(datasets) {
  const recordMap = new Map()
  
  for (const dataset of datasets) {
    if (!Array.isArray(dataset)) continue
    
    for (const record of dataset) {
      const key = getRecordKey(record)
      // Later records overwrite earlier ones (keeps most recent data)
      recordMap.set(key, record)
    }
  }
  
  // Convert back to array and sort by date
  const merged = Array.from(recordMap.values())
  return sortByDate(merged)
}

/**
 * Sorts records by date in ascending order
 * @param {Array} data - Array of records
 * @returns {Array} - Sorted array
 */
export function sortByDate(data) {
  return [...data].sort((a, b) => {
    const dateA = a.date || a.day || ''
    const dateB = b.date || b.day || ''
    return dateA.localeCompare(dateB)
  })
}

/**
 * Gets the date range from a dataset
 * @param {Array} data - Array of records
 * @returns {Object} - { startDate, endDate } or null if no dates found
 */
export function getDateRange(data) {
  if (!data || data.length === 0) return null
  
  const dates = data
    .map(r => r.date || r.day)
    .filter(Boolean)
    .sort()
  
  if (dates.length === 0) return null
  
  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1]
  }
}

/**
 * Gets statistics about the merged data
 * @param {Array} data - Merged data array
 * @returns {Object} - Statistics about the data
 */
export function getMergeStats(data) {
  const dateRange = getDateRange(data)
  const uniqueDates = new Set(data.map(r => r.date || r.day).filter(Boolean))
  const uniqueUsers = new Set(data.map(r => r.user_login || r.user).filter(Boolean))
  
  return {
    totalRecords: data.length,
    uniqueDates: uniqueDates.size,
    uniqueUsers: uniqueUsers.size,
    dateRange
  }
}
