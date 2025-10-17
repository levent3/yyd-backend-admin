-- CreateIndex
CREATE INDEX "Donation_paymentStatus_idx" ON "Donation"("paymentStatus");

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateIndex
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");

-- CreateIndex
CREATE INDEX "Donation_completedAt_idx" ON "Donation"("completedAt");

-- CreateIndex
CREATE INDEX "DonationCampaign_slug_idx" ON "DonationCampaign"("slug");

-- CreateIndex
CREATE INDEX "DonationCampaign_isActive_idx" ON "DonationCampaign"("isActive");

-- CreateIndex
CREATE INDEX "DonationCampaign_isFeatured_idx" ON "DonationCampaign"("isFeatured");

-- CreateIndex
CREATE INDEX "DonationCampaign_category_idx" ON "DonationCampaign"("category");

-- CreateIndex
CREATE INDEX "Donor_email_idx" ON "Donor"("email");

-- CreateIndex
CREATE INDEX "Donor_createdAt_idx" ON "Donor"("createdAt");

-- CreateIndex
CREATE INDEX "GalleryItem_mediaType_idx" ON "GalleryItem"("mediaType");

-- CreateIndex
CREATE INDEX "GalleryItem_projectId_idx" ON "GalleryItem"("projectId");

-- CreateIndex
CREATE INDEX "GalleryItem_createdAt_idx" ON "GalleryItem"("createdAt");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_idx" ON "News"("status");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "News_createdAt_idx" ON "News"("createdAt");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_isActive_idx" ON "Project"("isActive");

-- CreateIndex
CREATE INDEX "Project_isFeatured_idx" ON "Project"("isFeatured");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
