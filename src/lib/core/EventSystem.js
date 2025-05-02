/**
 * Event System for Battle Engine
 * 
 * This module provides a centralized event emitter for the battle system
 */

import { createNanoEvents } from 'nanoevents';

// Create a single event emitter instance
const eventEmitter = createNanoEvents();

// Event types enumeration
export const BATTLE_EVENTS = {
  BATTLE_STARTED: 'battle:started',
  TURN_STARTED: 'turn:started',
  MOVE_SELECTED: 'move:selected',
  MOVE_USED: 'move:used',
  MOVE_MISSED: 'move:missed',
  DAMAGE_CALCULATED: 'damage:calculated',
  DAMAGE_APPLIED: 'damage:applied',
  HEALING_APPLIED: 'healing:applied',
  STATUS_EFFECT_APPLIED: 'status:applied',
  STATUS_EFFECT_REMOVED: 'status:removed',
  STAT_BOOSTED: 'stat:boosted',
  STAT_LOWERED: 'stat:lowered',
  METRONOME_SELECTED: 'metronome:selected',
  POKEMON_FAINTED: 'pokemon:fainted',
  BATTLE_ENDED: 'battle:ended',
  SPEED_COMPARISON: 'speed:comparison',
  PP_UPDATED: 'pp:updated'
};

// Event emitter for components to subscribe to
export const battleEvents = {
  // Subscribe to an event, returns an unsubscribe function
  on: (event, callback) => {
    return eventEmitter.on(event, callback);
  },
  
  // Emit an event
  emit: (event, data) => {
    eventEmitter.emit(event, data);
  }
};

// Helper function to create standardized event objects
export function createEventData(type, data = {}) {
  return {
    type,
    timestamp: Date.now(),
    ...data
  };
}

// Debug function to log all events (for development only)
export function enableEventDebugMode() {
  Object.values(BATTLE_EVENTS).forEach(eventType => {
    battleEvents.on(eventType, (data) => {
      console.log(`[EVENT] ${eventType}`, data);
    });
  });
}