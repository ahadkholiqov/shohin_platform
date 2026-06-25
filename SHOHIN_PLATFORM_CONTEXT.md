# SHOHIN PLATFORM — PROJECT CONTEXT & SOURCE OF TRUTH

Version: 1.0
Status: Planning / Architecture Definition

## Project Overview

Shohin Platform is a custom real-estate sales platform built for a single residential complex (ЖК Шохин).

This is NOT a SaaS.
This is NOT a multi-tenant platform.
This is NOT intended to serve multiple developers or multiple projects.

The goal is to build and sell one complete solution to one developer.

## Core Philosophy

Keep everything simple.

Avoid:
- Multi-tenancy
- Tenant resolution
- Domain-based project routing
- Complex role systems
- SaaS architecture
- Enterprise abstractions
- Premature scalability

Optimize for:
- Speed of development
- Simplicity
- Maintainability
- Real business value
- Mobile users

## Product Structure

### Part 1 — Marketing Landing Page

Purpose: Sell the project.

Sections:
- Hero
- ЖК description
- Advantages
- Infrastructure
- Location
- Construction progress
- Gallery
- Floor plans
- Contacts
- WhatsApp
- Telegram
- Call button
- Application form

Main CTA: View available apartments.

### Part 2 — Apartment Platform

Accessible from the landing page.

Purpose:
- Explore apartments
- View chessboard
- Compare apartments
- Leave applications

## Mobile First

Priority:
1. Mobile
2. Tablet
3. Desktop

Most users are expected to arrive from mobile advertising.

## Chessboard Feature

Flagship feature.

Statuses:
- Available
- Reserved
- Sold

Requirements:
- Touch friendly
- Mobile optimized
- Fast
- Horizontal scrolling allowed
- Zoom if necessary

## Apartment Details

Contains:
- Apartment number
- Area
- Price
- Floor
- Section
- Room count
- Status
- Floor plan image
- Description

Primary action:
- Leave application

## Applications

Fields:
- Name
- Phone
- Comment (optional)

Store:
- Date
- Apartment reference
- Contact information

## Administration Panel

Single administrator.

Sections:
- Apartments
- Applications
- Gallery
- Content
- Settings

## Technical Stack

Frontend:
- React
- HTML
- CSS
- JavaScript

Backend:
- ASP.NET Core (.NET 10)
- C#

Database:
- PostgreSQL

IDE:
- Visual Studio

## Architecture Rules

Use clean architecture where useful.

Avoid architecture for architecture's sake.

Rules:
- Keep code understandable
- Keep modules small
- Avoid unnecessary abstractions
- Prefer explicit code
- Build only what is currently needed

## Explicitly Forbidden

Do NOT introduce:
- Multi-tenant architecture
- SaaS concepts
- Project-domain mapping
- Tenant context systems
- Tenant middleware
- Multiple project support
- Complex permissions
- Event buses
- Microservices
- Distributed architecture

## Development Priorities

1. Landing page
2. Apartment catalog
3. Chessboard
4. Applications
5. Administration panel

## AI Agent Instructions

Before making architectural decisions:

- Read this document
- Do not assume scalability requirements
- Do not invent enterprise abstractions
- Do not optimize for hypothetical future customers

Business goal:

Sell apartments for one residential complex.

If a simpler solution exists, prefer it.

## Current State

Project folder:
shohin_platform

Current state:
- Fresh start
- New architecture
- New codebase

Previous SaaS-style architecture was intentionally abandoned.

This document is the primary source of truth.
