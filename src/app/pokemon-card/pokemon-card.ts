import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Pokemon } from '../pokemon-list/pokemon-list';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCardComponent {
  @Input() pokemon!: Pokemon; 
  @Input() isInTeam: boolean = false; 

  @Output() addClicked = new EventEmitter<Event>(); 
  @Output() removeClicked = new EventEmitter<Event>(); 
  @Output() hoverCard = new EventEmitter<void>(); 
  @Output() infoClicked = new EventEmitter<Event>(); // NOVA PORTA: Para as stats
}