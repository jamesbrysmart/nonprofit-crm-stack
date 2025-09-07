# Data Model

This document outlines the database schema for the custom services in this project.

## `fundraising-service`

### Campaign Entity

Represents a fundraising campaign.

| Column      | Data Type         | Description                               |
|-------------|-------------------|-------------------------------------------|
| `id`        | `uuid`            | The primary key for the campaign.         |
| `name`      | `string`          | The name of the campaign.                 |
| `startDate` | `date`            | The date the campaign starts.             |
| `endDate`   | `date`            | The date the campaign ends.               |

### Gift Entity

Represents a single gift or donation.

| Column       | Data Type         | Description                               |
|--------------|-------------------|-------------------------------------------|
| `id`         | `uuid`            | The primary key for the gift.             |
| `campaignId` | `string` (uuid)   | Foreign key linking to a `campaign`.      |
| `contactId`  | `string` (uuid)   | Foreign key linking to a `contact` in Twenty. |
| `amount`     | `decimal(10, 2)`  | The monetary value of the gift.           |
| `date`       | `date`            | The date the gift was made.               |
