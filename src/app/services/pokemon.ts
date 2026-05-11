import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// As interfaces que definem o formato dos dados
export interface PokemonApiItem {
  name: string;
  url: string;
}

export interface PokemonApiResponse {
  results: PokemonApiItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  constructor(private http: HttpClient) { }

  getPokemons(limit: number, offset: number) {

    console.log(`Fetching pokemons with limit=${limit} and offset=${offset}, https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`); 
    return this.http.get<PokemonApiResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
  }
}