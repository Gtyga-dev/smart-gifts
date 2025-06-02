"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export const dynamic = 'force-dynamic';


export default function Terms() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center">Terms and Conditions</h1>
      <p className="mt-6 text-lg text-gray-600 text-center">
        Please read these Terms and Conditions carefully before using our platform. By accessing or using Smart Cards, you agree to comply with these terms.
      </p>

      {/* Tabs Section */}
      <Tabs className="mt-12">
        {/* Tabs List */}
        <TabsList className="flex justify-start space-x-4 overflow-x-auto pb-2">
          <TabsTrigger value="general" className="text-lg font-medium text-gray-900 whitespace-nowrap">General</TabsTrigger>
          <TabsTrigger value="services" className="text-lg font-medium text-gray-900 whitespace-nowrap">Services</TabsTrigger>
          <TabsTrigger value="payments" className="text-lg font-medium text-gray-900 whitespace-nowrap">Payments</TabsTrigger>
          <TabsTrigger value="delivery" className="text-lg font-medium text-gray-900 whitespace-nowrap">Gift Cards</TabsTrigger>
          <TabsTrigger value="responsibilities" className="text-lg font-medium text-gray-900 whitespace-nowrap">User Responsibilities</TabsTrigger>
          <TabsTrigger value="security" className="text-lg font-medium text-gray-900 whitespace-nowrap">Security</TabsTrigger>
          <TabsTrigger value="refunds" className="text-lg font-medium text-gray-900 whitespace-nowrap">Refunds & Cancellations</TabsTrigger>
          <TabsTrigger value="privacy" className="text-lg font-medium text-gray-900 whitespace-nowrap">Privacy</TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="general">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">General Terms</h3>
            <p>
              By accessing or using Smart Cards, you acknowledge and agree to these Terms and Conditions, along with any updates or modifications.
            </p>
            <p>
              If you do not agree with any part of these terms, you must stop using our services.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Services</h3>
            <p>
              Smart Cards provides an online platform for purchasing and managing gift cards. We may modify or discontinue services at any time without prior notice.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Payments</h3>
            <p>
              All payments on Smart Cards must be completed using supported payment methods: mobile payments, Visa cards, or bank transfers.
            </p>
            <p>
              Prices are displayed in the applicable currency and may include transaction fees. Smart Cards is not responsible for additional charges by your bank or payment provider.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Delivery and Use of Gift Cards</h3>
            <p>
              Gift cards are delivered electronically upon successful payment. Please ensure your email address or delivery details are correct.
            </p>
            <p>
              Gift cards are subject to the terms and conditions of the issuing brand or merchant.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="responsibilities">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">User Responsibilities</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account information. Any unauthorized use of your account must be reported immediately.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Security</h3>
            <p>
              Users are prohibited from fraudulent or illegal activities, reselling gift cards without authorization, or attempting to exploit smartcards&apos;s systems.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Refunds & Cancellations</h3>
            <p>
              All purchases are final, and no refunds or cancellations are allowed once a transaction is complete.
            </p>
            <p>
              In case of delivery issues, contact our support team for assistance.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="mt-6 text-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Privacy</h3>
            <p>
              Your privacy is important to us. Please refer to our Privacy Policy for details on how we collect, use, and protect your information.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
